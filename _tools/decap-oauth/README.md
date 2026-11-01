# Login helper for the writing panel

The writing panel (`https://sergioqs.github.io/admin/`, Decap CMS) signs in with GitHub. GitHub needs a small
server to finish the sign-in; `worker.js` is that server, as a free Cloudflare Worker. Only GitHub accounts that can
write to this repository can save anything in the panel.

One-time setup (about 10 minutes):

1. **Create the worker** (free Cloudflare account): Cloudflare dashboard → _Workers & Pages_ → _Create_ →
   _Start with Hello World_. Name it `sergioqs-cms-auth` → _Deploy_. Then _Edit code_, replace everything with the
   contents of `worker.js`, and _Deploy_ again. Note its address, e.g. `https://sergioqs-cms-auth.<your-account>.workers.dev`.

2. **Create a GitHub OAuth app**: GitHub → _Settings_ → _Developer settings_ → _OAuth Apps_ → _New OAuth App_.
   - Application name: `Panel de escritura`
   - Homepage URL: `https://sergioqs.github.io`
   - Authorization callback URL: `https://sergioqs-cms-auth.<your-account>.workers.dev/callback`

   Then _Generate a new client secret_ and copy the Client ID and the secret.

3. **Give them to the worker**: in Cloudflare, the worker → _Settings_ → _Variables and Secrets_:
   - `GITHUB_CLIENT_ID` (type _Text_): the Client ID
   - `GITHUB_CLIENT_SECRET` (type _Secret_): the client secret

4. **Point the panel to the worker**: in `admin/config.yml`, set `base_url:` to the worker's address
   (without `/auth` or `/callback`), commit and push.

5. Open `https://sergioqs.github.io/admin/` → _Iniciar sesión_ → authorize the app on GitHub.

The token stays in your browser (the panel uses it to commit to the repository through GitHub's API). To revoke
access, delete the app's authorization in GitHub → _Settings_ → _Applications_.

## Writing on your computer without signing in

With the site running locally (`http://localhost:4000`), start `npx decap-server` in the repository folder and
open `http://localhost:4000/admin/`: the panel then reads and writes the local files directly (no GitHub, no
worker).
