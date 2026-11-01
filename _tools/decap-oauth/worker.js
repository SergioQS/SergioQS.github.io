/**
 * GitHub login helper for the writing panel (https://sergioqs.github.io/admin/), as a Cloudflare Worker.
 * Setup: see README.md in this folder.
 *
 * Flow: the panel opens  <worker>/auth  in a small window -> GitHub asks you to sign in ->
 * GitHub sends you back to  <worker>/callback  -> the worker exchanges GitHub's code for a token
 * and hands it to the panel window. The token is only handed to the addresses in ALLOWED_ORIGINS.
 *
 * Settings of the worker (Cloudflare -> the worker -> Settings -> Variables and Secrets):
 *   GITHUB_CLIENT_ID      (text)   Client ID of the GitHub OAuth app
 *   GITHUB_CLIENT_SECRET  (secret) Client secret of the GitHub OAuth app
 */

const ALLOWED_ORIGINS = ["https://sergioqs.github.io"];
const STATE_COOKIE = "decap_oauth_state";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return startLogin(url, env);
    if (url.pathname === "/callback") return finishLogin(url, request, env);
    return new Response("Login helper for the writing panel of sergioqs.github.io", { status: 200 });
  },
};

// Step 1: send the browser to GitHub's sign-in page
function startLogin(url, env) {
  if (url.searchParams.get("provider") !== "github") return new Response("Unknown provider", { status: 400 });
  if (!env.GITHUB_CLIENT_ID) return new Response("GITHUB_CLIENT_ID is not set in the worker", { status: 500 });
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/callback`,
    scope: url.searchParams.get("scope") || "public_repo",
    state,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      "Set-Cookie": `${STATE_COOKIE}=${state}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

// Step 2: GitHub came back with a code; trade it for a token
async function finishLogin(url, request, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("Cookie") || "").match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]+)`));
  if (!code || !state || !cookie || cookie[1] !== state) {
    return reply("error", { message: "The sign-in expired or is not valid. Close this window and try again." });
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "sergioqs-cms-auth" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!data.access_token) return reply("error", { message: data.error_description || "GitHub did not return a token." });
  return reply("success", { token: data.access_token, provider: "github" });
}

// Step 3: hand the result to the panel window (Decap CMS's handshake), only to an allowed address
function reply(status, content) {
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, "\\u003c");
  const allowed = JSON.stringify(ALLOWED_ORIGINS);
  const text =
    status === "success" ? "Sesión iniciada. Esta ventana se cerrará sola." : "No se pudo iniciar sesión. Cierra esta ventana e inténtalo de nuevo.";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Panel de escritura</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #000; color: #f2f2f2"><p>${text}</p>
<script>
  (function () {
    var allowed = ${allowed};
    function receive(event) {
      if (allowed.indexOf(event.origin) === -1) return;
      window.removeEventListener("message", receive);
      window.opener.postMessage(${message}, event.origin);
    }
    if (!window.opener) return;
    window.addEventListener("message", receive);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": `${STATE_COOKIE}=; Path=/callback; Max-Age=0`,
    },
  });
}
