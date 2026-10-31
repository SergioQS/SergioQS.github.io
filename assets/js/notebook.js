// Jupyter notebooks shown in posts (_includes/notebook.liquid):
// show/hide all code, a copy button on each code cell, external links in a new tab,
// and the side table of contents built from the notebook's headings (called from common.js).
(function () {
  var isEnglish = function () {
    return document.documentElement.getAttribute("data-lang") === "en";
  };

  document.querySelectorAll(".notebook").forEach(function (notebook) {
    var toggle = notebook.querySelector(".notebook-toggle-code");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var hide = !notebook.classList.contains("code-hidden");
        notebook.classList.toggle("code-hidden", hide);
        toggle.setAttribute("aria-pressed", hide ? "true" : "false");
        notebook.querySelectorAll("details.nb-input").forEach(function (cell) {
          cell.open = !hide;
        });
      });
    }

    notebook.querySelectorAll("details.nb-input").forEach(function (cell) {
      var summary = cell.querySelector("summary");
      var code = cell.querySelector("pre");
      if (!summary || !code || !navigator.clipboard) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "nb-copy";
      button.innerHTML = '<i class="fa-solid fa-clipboard" aria-hidden="true"></i>';
      var label = function () {
        var text = isEnglish() ? "Copy code" : "Copiar código";
        button.title = text;
        button.setAttribute("aria-label", text);
      };
      label();
      document.addEventListener("site-lang-change", label);
      button.addEventListener("click", function (event) {
        // the button sits in the <summary>: don't fold the cell
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard.writeText(code.innerText.replace(/\n+$/, "")).then(function () {
          button.innerHTML = '<i class="fa-solid fa-clipboard-check" aria-hidden="true"></i>';
          setTimeout(function () {
            button.innerHTML = '<i class="fa-solid fa-clipboard" aria-hidden="true"></i>';
          }, 2000);
        });
      });
      summary.appendChild(button);
    });

    notebook.querySelectorAll('.notebook-body a[href^="http"]').forEach(function (link) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  });

  // Side table of contents from the notebook's headings (h1-h3). Notebooks use heading levels
  // freely: the first level of the list is the highest level used more than once (a lone title
  // heading also stays at the first level), and deeper headings go under the entry before them.
  window.buildNotebookToc = function (nav) {
    var body = document.querySelector(".notebook-body");
    if (!body || !nav) return false;
    var headings = Array.prototype.filter.call(body.querySelectorAll("h1, h2, h3"), function (h) {
      return h.textContent.trim() !== "";
    });
    if (headings.length === 0) return false;

    var used = {};
    var slug = function (text) {
      var base =
        "nb-" +
        text
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      var id = base;
      for (var n = 2; used[id] || document.getElementById(id); n++) id = base + "-" + n;
      used[id] = true;
      return id;
    };

    var level = function (h) {
      return Number(h.tagName[1]);
    };
    var count = {};
    headings.forEach(function (h) {
      count[level(h)] = (count[level(h)] || 0) + 1;
    });
    var levels = Object.keys(count)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    var top =
      levels.filter(function (l) {
        return count[l] > 1;
      })[0] || levels[0];

    var list = document.createElement("ul");
    list.className = "nav navbar-nav";
    var parent = null;
    headings.forEach(function (heading) {
      if (!heading.id) heading.id = slug(heading.textContent.trim());
      var link = document.createElement("a");
      link.className = "nav-link";
      link.href = "#" + heading.id;
      link.textContent = heading.textContent.trim();
      var item = document.createElement("li");
      item.appendChild(link);
      if (level(heading) <= top) {
        list.appendChild(item);
        parent = item;
      } else if (!parent) {
        list.appendChild(item);
      } else {
        var sub = parent.querySelector("ul");
        if (!sub) {
          sub = document.createElement("ul");
          sub.className = "nav navbar-nav";
          parent.appendChild(sub);
        }
        sub.appendChild(item);
      }
    });
    nav.appendChild(list);
    nav.setAttribute("data-toggle", "toc");
    return true;
  };
})();
