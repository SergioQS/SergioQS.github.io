/*
 * Writing panel (Decap CMS) for sergioqs.github.io — custom parts:
 *   1. light/dark switch, shared with the site (localStorage "theme")
 *   2. LaTeX: the same rules as the site build (_plugins/latex.rb), drawn with MathJax
 *   3. markdown -> HTML exactly as the site shows it (code cells, outputs, figures, PDFs)
 *   4. notebook (.ipynb) -> HTML, as _plugins/notebooks.rb shows it on the site
 *   5. the preview: the post as it will look on the site
 *   6. the "cells" editor for the post body: text, code, output, figure and PDF cells
 *   7. before saving: notebook posts get the side table of contents
 */
(function () {
  "use strict";

  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  var REPO = "SergioQS/SergioQS.github.io";
  var BRANCH = "main";

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function textOf(source) {
    return Array.isArray(source) ? source.join("") : String(source == null ? "" : source);
  }

  /* ------------------------------------------------------------------------------------------
   * 1. Light / dark
   * ---------------------------------------------------------------------------------------- */
  var Theme = {
    get: function () {
      try {
        return localStorage.getItem("theme") === "light" ? "light" : "dark";
      } catch (e) {
        return "dark";
      }
    },
    set: function (theme) {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
      document.documentElement.setAttribute("data-theme", theme);
      window.dispatchEvent(new CustomEvent("panel-theme", { detail: theme }));
    },
    toggle: function () {
      Theme.set(Theme.get() === "dark" ? "light" : "dark");
    },
  };

  var SUN =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/></svg>';
  var MOON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>';

  function addThemeButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "panel-theme-toggle";
    var paint = function () {
      var dark = Theme.get() === "dark";
      button.innerHTML = dark ? SUN : MOON;
      button.title = dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      button.setAttribute("aria-label", button.title);
    };
    paint();
    button.addEventListener("click", function () {
      Theme.toggle();
      paint();
    });
    document.body.appendChild(button);
  }

  /* ------------------------------------------------------------------------------------------
   * 2. LaTeX — same rules as _plugins/latex.rb
   *    inline $...$ \(...\)   display $$...$$ \[...\] \begin{env}...\end{env}
   *    not inside code; "$ " and a closing "$" before a digit are not math
   * ---------------------------------------------------------------------------------------- */
  var MATH =
    /(?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([A-Za-z]+\*?)\}[\s\S]+?\\end\{\1\}|(?<![\\$])\$(?![\s$])(?:\\[\s\S]|[^\\$\n]|\n(?![ \t]*\n))+?(?<![\s\\])\$(?!\d)/g;
  var CODE_SPAN = /(`+)(?!`)[\s\S]+?(?<!`)\1(?!`)/g;
  var FENCE_START = /^( {0,3})(`{3,}|~{3,})/;

  // [{code: bool, text}] — fenced code blocks kept apart from prose
  function splitFences(text) {
    var parts = [];
    var buffer = "";
    var fence = null;
    var lines = String(text).split(/(?<=\n)/);
    lines.forEach(function (line) {
      if (fence) {
        buffer += line;
        var close = new RegExp("^ {0,3}" + (fence[0] === "`" ? "`" : "~") + "{" + fence.length + ",}\\s*$");
        if (close.test(line)) {
          parts.push({ code: true, text: buffer });
          buffer = "";
          fence = null;
        }
      } else {
        var m = line.match(FENCE_START);
        if (m) {
          if (buffer) parts.push({ code: false, text: buffer });
          buffer = line;
          fence = m[2];
        } else {
          buffer += line;
        }
      }
    });
    if (buffer) parts.push({ code: !!fence, text: buffer });
    return parts;
  }

  function mapProse(text, fn) {
    return splitFences(text)
      .map(function (part) {
        return part.code ? part.text : fn(part.text);
      })
      .join("");
  }

  // notebooks (like nbconvert): a closing $ may follow a space
  var MATH_NOTEBOOK = new RegExp(MATH.source.replace("(?<![\\s\\\\])\\$(?!\\d)", "(?<!\\\\)\\$"), "g");

  function protectMath(text, notebook) {
    var pattern = notebook ? MATH_NOTEBOOK : MATH;
    var formulas = [];
    var out = mapProse(text, function (prose) {
      var spans = [];
      prose = prose.replace(CODE_SPAN, function (span) {
        spans.push(span);
        return "\u0000CODE" + (spans.length - 1) + "\u0000";
      });
      prose = prose.replace(pattern, function (formula) {
        formulas.push(formula);
        return "XLATEXF" + (formulas.length - 1) + "X";
      });
      return prose.replace(/\u0000CODE(\d+)\u0000/g, function (_, i) {
        return spans[Number(i)];
      });
    });
    return { text: out, formulas: formulas };
  }

  function mathReady() {
    return !!(window.MathJax && window.MathJax.tex2svg);
  }

  function formulaHtml(formula) {
    var display = true;
    var tex = formula;
    if (/^\$\$/.test(formula)) tex = formula.slice(2, -2);
    else if (/^\\\[/.test(formula)) tex = formula.slice(2, -2);
    else if (/^\\\(/.test(formula)) {
      tex = formula.slice(2, -2);
      display = false;
    } else if (/^\$/.test(formula)) {
      tex = formula.slice(1, -1);
      display = false;
    }
    if (!mathReady()) return '<span class="math-pending">' + esc(formula) + "</span>";
    try {
      return window.MathJax.tex2svg(tex, { display: display }).outerHTML;
    } catch (e) {
      return '<span class="math-error">' + esc(formula) + "</span>";
    }
  }

  function restoreMath(html, formulas) {
    return html.replace(/XLATEXF(\d+)X/g, function (all, i) {
      var formula = formulas[Number(i)];
      return formula == null ? all : formulaHtml(formula);
    });
  }

  /* ------------------------------------------------------------------------------------------
   * 3. Markdown -> HTML, as the site shows it
   * ---------------------------------------------------------------------------------------- */
  var LANG_ALIASES = { py: "python", jl: "julia", wolfram: "mathematica", wl: "mathematica", tex: "latex", sh: "bash", js: "javascript" };

  function highlight(code, lang) {
    var name = LANG_ALIASES[lang] || lang;
    if (window.hljs && name && window.hljs.getLanguage(name)) {
      try {
        return window.hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
      } catch (e) {}
    }
    return esc(code);
  }

  // Same HTML as kramdown + rouge on the site: <div class="language-x highlighter-rouge">
  function codeBlockHtml(code, info) {
    var lang = String(info || "")
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();
    code = code.replace(/\n$/, "");
    var body = lang === "output" || !lang ? esc(code) : highlight(code, lang);
    return (
      '<div class="language-' +
      esc(lang || "plaintext") +
      ' highlighter-rouge"><div class="highlight"><pre class="highlight"><code>' +
      body +
      "\n</code></pre></div></div>"
    );
  }

  var markdown = null;
  function md() {
    if (!markdown && window.markdownit) {
      markdown = window.markdownit({ html: true, linkify: true, typographer: false });
      markdown.renderer.rules.fence = function (tokens, idx) {
        return codeBlockHtml(tokens[idx].content, tokens[idx].info);
      };
      markdown.renderer.rules.code_block = function (tokens, idx) {
        return codeBlockHtml(tokens[idx].content, "");
      };
    }
    return markdown;
  }

  // key="value" key='value' key=value
  function parseArgs(text) {
    var args = {};
    var order = [];
    String(text).replace(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g, function (_, key, a, b, c) {
      args[key] = a != null ? a : b != null ? b : c;
      order.push(key);
      return "";
    });
    args.__order = order;
    return args;
  }

  function figureHtml(args, ctx) {
    var src = args.url || ctx.asset(args.path || "", "figure");
    var style = ["max-width", "max-height", "min-width", "min-height"]
      .filter(function (k) {
        return args[k];
      })
      .map(function (k) {
        return k + ":" + args[k];
      })
      .join(";");
    return (
      '<figure><picture><img src="' +
      esc(src) +
      '" class="' +
      esc(args.class || "img-fluid rounded z-depth-1") +
      '" width="' +
      esc(args.width || "100%") +
      '" height="auto"' +
      (style ? ' style="' + esc(style) + '"' : "") +
      (args.alt ? ' alt="' + esc(args.alt) + '"' : "") +
      "></picture>" +
      (args.caption ? '<figcaption class="caption">' + inlineHtml(args.caption) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  function pdfHtml(path, pages, ctx) {
    var url = ctx.asset(path || "", "pdf");
    return (
      '<div class="embedded-pdf"><object class="' +
      (pages === "single" ? "pdf-single-page" : "pdf-multi-page") +
      '" data="' +
      esc(url) +
      '" type="application/pdf" width="100%"></object><p class="pdf-links"><a href="' +
      esc(url) +
      '" target="_blank" rel="noopener">Abrir en una pestaña nueva</a> &middot; <a href="' +
      esc(url) +
      '" download>Descargar PDF</a></p></div>'
    );
  }

  // Liquid the preview understands (figures, PDFs); other {% tags %} are hidden like on the site
  function renderLiquid(text, ctx, blocks) {
    var put = function (html) {
      blocks.push(html);
      return "\n\nXBLOCK" + (blocks.length - 1) + "X\n\n";
    };
    return mapProse(text, function (prose) {
      return prose
        .replace(/\{%-?\s*assign\s+pdf_path\s*=\s*'([^']+)'[\s\S]*?\{%-?\s*endif\s*-?%\}/g, function (_, path) {
          return put(pdfHtml(path, "multi", ctx));
        })
        .replace(/\{%-?\s*include\s+figure\.liquid\s+([\s\S]*?)-?%\}/g, function (_, args) {
          return put(figureHtml(parseArgs(args), ctx));
        })
        .replace(/\{%-?\s*include\s+pdf\.liquid\s+([\s\S]*?)-?%\}/g, function (_, args) {
          var a = parseArgs(args);
          return put(pdfHtml(a.path, a.pages, ctx));
        })
        .replace(/\{%-?\s*(end)?raw\s*-?%\}\n?/g, "")
        .replace(/\{%[\s\S]*?%\}/g, "");
    });
  }

  function markdownHtml(text, ctx, notebook) {
    var renderer = md();
    if (!renderer) return "<pre>" + esc(text) + "</pre>";
    var blocks = [];
    var source = ctx ? renderLiquid(text, ctx, blocks) : text;
    var math = protectMath(source, notebook);
    var html = renderer.render(math.text);
    html = restoreMath(html, math.formulas);
    return html.replace(/<p>XBLOCK(\d+)X<\/p>|XBLOCK(\d+)X/g, function (_, a, b) {
      return blocks[Number(a != null ? a : b)] || "";
    });
  }

  function inlineHtml(text) {
    var renderer = md();
    if (!renderer) return esc(text);
    var math = protectMath(text);
    return restoreMath(renderer.renderInline(math.text), math.formulas);
  }

  /* ------------------------------------------------------------------------------------------
   * 4. Notebook (.ipynb) -> HTML, like _plugins/notebooks.rb + _includes/notebook.liquid
   * ---------------------------------------------------------------------------------------- */
  var ANSI_COLORS = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

  function ansiHtml(text) {
    var out = "";
    var bold = false;
    var color = null;
    var parts = String(text).split(/\x1b\[([\d;]*)m/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        (parts[i] || "0").split(";").forEach(function (codeText) {
          var code = Number(codeText || 0);
          if (code === 0) {
            bold = false;
            color = null;
          } else if (code === 1) bold = true;
          else if (code === 22) bold = false;
          else if (code >= 30 && code <= 37) color = "ansi-" + ANSI_COLORS[code - 30] + "-fg";
          else if (code >= 90 && code <= 97) color = "ansi-" + ANSI_COLORS[code - 90] + "-intense-fg";
          else if (code === 39) color = null;
        });
        continue;
      }
      var chunk = esc(parts[i].replace(/\x1b\[[\d;?]*[A-Za-z]/g, ""));
      if (!chunk) continue;
      var classes = [color, bold ? "ansi-bold" : null].filter(Boolean).join(" ");
      out += classes ? '<span class="' + classes + '">' + chunk + "</span>" : chunk;
    }
    return out;
  }

  function outputHtml(output) {
    var wrap = function (inner) {
      return '<div class="output_area">' + inner + "</div>";
    };
    if (output.output_type === "stream") {
      var stream = output.name === "stderr" ? "output_stderr" : "output_stdout";
      return wrap('<div class="output_subarea output_stream ' + stream + ' output_text"><pre>' + ansiHtml(textOf(output.text)) + "</pre></div>");
    }
    if (output.output_type === "error") {
      return wrap('<div class="output_subarea output_text output_error"><pre>' + ansiHtml((output.traceback || []).join("\n")) + "</pre></div>");
    }
    var data = output.data || {};
    var extra = output.output_type === "execute_result" ? " output_execute_result" : "";
    var image = function (mime, cls) {
      var value = textOf(data[mime]).replace(/\s+/g, "");
      return wrap('<div class="' + cls + " output_subarea" + extra + '"><img loading="lazy" src="data:' + mime + ";base64," + value + '"></div>');
    };
    if (data["text/html"]) return wrap('<div class="output_html rendered_html output_subarea' + extra + '">' + textOf(data["text/html"]) + "</div>");
    if (data["text/markdown"])
      return wrap('<div class="output_markdown rendered_html output_subarea' + extra + '">' + markdownHtml(textOf(data["text/markdown"])) + "</div>");
    if (data["image/svg+xml"])
      return wrap(
        '<div class="output_svg output_subarea' +
          extra +
          '"><img src="data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(textOf(data["image/svg+xml"])) +
          '"></div>'
      );
    if (data["text/latex"])
      return wrap('<div class="output_latex output_subarea' + extra + '">' + markdownHtml(textOf(data["text/latex"])) + "</div>");
    if (data["image/png"]) return image("image/png", "output_png");
    if (data["image/jpeg"]) return image("image/jpeg", "output_jpeg");
    if (data["image/gif"]) return image("image/gif", "output_png");
    if (data["text/plain"])
      return wrap('<div class="output_text output_subarea' + extra + '"><pre>' + ansiHtml(textOf(data["text/plain"])) + "</pre></div>");
    return "";
  }

  function plainHeading(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function notebookLanguage(nb) {
    var meta = nb.metadata || {};
    var name = (meta.language_info && meta.language_info.name) || (meta.kernelspec && meta.kernelspec.language) || "";
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
  }

  function notebookWords(nb) {
    return (nb.cells || []).reduce(function (sum, cell) {
      if (cell.cell_type !== "markdown" && cell.cell_type !== "code") return sum;
      var text = textOf(cell.source).trim();
      return sum + (text ? text.split(/\s+/).length : 0);
    }, 0);
  }

  function notebookHtml(nb, path, title) {
    var language = notebookLanguage(nb);
    var lang = language.toLowerCase();
    var cells = (nb.cells || [])
      .map(function (cell) {
        var source = textOf(cell.source);
        if (cell.cell_type === "markdown") {
          // like Jupyter and nbconvert, "###Title" (no space) is a heading
          source = mapProse(source, function (prose) {
            return prose.replace(/^(#{1,6})(?=[^#\s])/gm, "$1 ");
          });
          var attachments = cell.attachments || {};
          source = source.replace(/attachment:([^)\s]+)/g, function (all, name) {
            var files = attachments[name];
            if (!files) return all;
            var mime = Object.keys(files)[0];
            return "data:" + mime + ";base64," + textOf(files[mime]).replace(/\s+/g, "");
          });
          return (
            '<div class="cell border-box-sizing text_cell rendered"><div class="inner_cell"><div class="text_cell_render border-box-sizing rendered_html">' +
            markdownHtml(source, null, true) +
            "</div></div></div>"
          );
        }
        if (cell.cell_type === "code") {
          var tags = (cell.metadata && cell.metadata.tags) || [];
          var input =
            '<details class="nb-input"' +
            (tags.indexOf("hide-input") === -1 ? " open" : "") +
            '><summary class="nb-input-header"><span class="nb-lang">' +
            esc(language) +
            '</span></summary><div class="input"><div class="inner_cell"><div class="input_area"><div class="highlight hl-' +
            esc(lang) +
            '"><pre>' +
            highlight(source, lang) +
            "\n</pre></div></div></div></div></details>";
          var outputs = (cell.outputs || []).map(outputHtml).join("");
          return (
            '<div class="cell border-box-sizing code_cell rendered">' +
            input +
            (outputs ? '<div class="output_wrapper"><div class="output">' + outputs + "</div></div>" : "") +
            "</div>"
          );
        }
        return "";
      })
      .join("\n");

    // the post already shows its title: drop a first heading with the same text
    var first = cells.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (first && title && plainHeading(first[1]) === plainHeading(esc(title))) cells = cells.replace(first[0], "");

    var file = String(path || "").replace(/^\/+/, "");
    return (
      '<div class="notebook"><div class="notebook-toolbar"><span class="notebook-label"><i class="fa-solid fa-book-open"></i> Notebook' +
      (language ? " &middot; " + esc(language) : "") +
      '</span><div class="notebook-actions">' +
      '<a class="notebook-btn notebook-btn-primary" target="_blank" rel="noopener" href="https://colab.research.google.com/github/' +
      REPO +
      "/blob/" +
      BRANCH +
      "/" +
      esc(file) +
      '"><i class="fa-solid fa-play"></i> Abrir en Colab</a>' +
      '<a class="notebook-btn" target="_blank" rel="noopener" href="https://github.com/' +
      REPO +
      "/blob/" +
      BRANCH +
      "/" +
      esc(file) +
      '"><i class="fa-brands fa-github"></i> Ver en GitHub</a>' +
      '<span class="notebook-btn"><i class="fa-solid fa-download"></i> Descargar .ipynb</span>' +
      '<span class="notebook-btn"><i class="fa-solid fa-code"></i> Ocultar código</span>' +
      '</div></div><div class="notebook-body">' +
      cells +
      "</div></div>"
    );
  }

  /* ------------------------------------------------------------------------------------------
   * 5. Preview: the post as the site shows it
   * ---------------------------------------------------------------------------------------- */
  var MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var SECTIONS = { mathematics: "Matemáticas", computation: "Computación", "other-areas": "Otras áreas" };

  function longDate(value) {
    if (!value) return "";
    var date = value instanceof Date ? value : new Date(String(value).replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T"));
    if (isNaN(date)) return esc(String(value));
    return date.getDate() + " de " + MONTHS[date.getMonth()] + " de " + date.getFullYear();
  }

  var notebookCache = {};

  // URL of a file Decap knows about: its own URL, or one made from the file just uploaded
  var fileUrls = typeof WeakMap === "function" ? new WeakMap() : null;
  function assetUrl(asset) {
    if (!asset) return "";
    var url = String(asset);
    if (/^(blob:|data:|https?:)/.test(url)) return url;
    var file = asset.fileObj;
    if (file && file.size > 0 && fileUrls) {
      if (!fileUrls.has(file)) fileUrls.set(file, URL.createObjectURL(file));
      return fileUrls.get(file);
    }
    return "";
  }

  function fetchNotebook(urls) {
    var key = urls.join("|");
    if (!notebookCache[key]) {
      notebookCache[key] = urls
        .reduce(
          function (chain, url) {
            return chain.catch(function () {
              return fetch(url).then(function (response) {
                if (!response.ok) throw new Error(response.status + " " + url);
                return response.json();
              });
            });
          },
          Promise.reject(new Error("start"))
        )
        .catch(function (error) {
          delete notebookCache[key];
          throw error;
        });
    }
    return notebookCache[key];
  }

  var PostPreview = createClass({
    getInitialState: function () {
      return { notebook: null, notebookKey: null, notebookError: null, tick: 0 };
    },

    componentDidMount: function () {
      var self = this;
      this.redraw = function () {
        self.setState({ tick: self.state.tick + 1 });
      };
      window.addEventListener("panel-theme", this.redraw);
      if (!mathReady() && window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(this.redraw);
      }
      this.syncFrame();
      this.loadNotebook();
    },

    componentDidUpdate: function () {
      this.syncFrame();
      this.loadNotebook();
    },

    componentWillUnmount: function () {
      window.removeEventListener("panel-theme", this.redraw);
    },

    // the preview frame follows the panel's theme
    syncFrame: function () {
      var doc = this.props.document;
      if (!doc || !doc.documentElement) return;
      doc.documentElement.setAttribute("data-theme", Theme.get());
      doc.documentElement.setAttribute("data-lang", "es");
      doc.documentElement.setAttribute("lang", "es");
    },

    field: function (name) {
      var fields = this.props.fields;
      return fields && fields.find
        ? fields.find(function (f) {
            return f.get("name") === name;
          })
        : null;
    },

    // A file's address for the preview: files just uploaded in the panel come from Decap (not on
    // the site yet); everything else is read from the site itself.
    // kind: "image" (cover), "notebook", "figure" or "pdf"
    asset: function (path, kind) {
      if (!path) return "";
      path = String(path);
      if (/^(https?:|data:|blob:)/.test(path)) return path;
      var clean = path.replace(/^\/+/, "");
      var folders = {
        image: ["image", "assets/img"],
        notebook: ["notebook", "assets/jupyter"],
        figure: ["body", "assets/img/posts"],
        pdf: ["body", "assets/pdf"],
      };
      var spec = folders[kind || "figure"];
      if (spec && clean.indexOf(spec[1] + "/") === 0) {
        var field = this.field(spec[0]);
        if (field && kind === "pdf") field = pdfField(field);
        var url = assetUrl(this.props.getAsset(path, field));
        if (url) return url;
      }
      return "/" + clean;
    },

    loadNotebook: function () {
      var self = this;
      var path = this.props.entry.getIn(["data", "notebook"]);
      var urls = [];
      if (path) {
        var fromPanel = this.asset(path, "notebook");
        var fromSite = "/" + String(path).replace(/^\/+/, "");
        urls.push(fromPanel);
        if (fromSite !== fromPanel) urls.push(fromSite);
      }
      var key = urls.join("|");
      if (key === this.state.notebookKey) return;
      this.setState({ notebookKey: key, notebook: null, notebookError: null });
      if (!path) return;
      fetchNotebook(urls).then(
        function (nb) {
          if (self.state.notebookKey === key) self.setState({ notebook: nb });
        },
        function () {
          if (self.state.notebookKey === key) self.setState({ notebookError: path });
        }
      );
    },

    render: function () {
      var entry = this.props.entry;
      var data = entry.get("data");
      var get = function (name) {
        var value = data && data.get(name);
        return value && value.toJS ? value.toJS() : value;
      };
      var title = get("title") || "";
      var date = get("date");
      var year = date ? new Date(String(date).replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T")).getFullYear() : "";
      var tags = String(get("tags") || "")
        .split(/[\s,]+/)
        .filter(Boolean);
      var category = get("categories");
      var image = get("image");
      var body = get("body") || "";
      var ctx = { asset: this.asset };

      var html = "";
      if (get("published") === false)
        html += '<p class="preview-note">Esta entrada está oculta en el sitio («Visible en el sitio» está apagado).</p>';
      html += '<div class="post">';
      if (image) html += '<div class="post-hero"><img src="' + esc(this.asset(image, "image")) + '" alt=""></div>';
      html += '<header class="post-header"><h1 class="post-title">' + esc(title) + "</h1>";
      html += '<p class="post-meta">Publicado el ' + longDate(date) + "</p>";
      html += '<p class="post-tags"><i class="fa-solid fa-calendar fa-sm"></i> ' + esc(year);
      if (tags.length) {
        html +=
          " &nbsp; &middot; &nbsp; " +
          tags
            .map(function (tag) {
              return '<i class="fa-solid fa-hashtag fa-sm"></i> ' + esc(tag);
            })
            .join(" &nbsp; ");
      }
      if (category) html += ' &nbsp; &middot; &nbsp; <i class="fa-solid fa-tag fa-sm"></i> ' + esc(SECTIONS[category] || category);
      html += "</p></header>";
      html += '<article class="post-content"><div id="markdown-content">' + markdownHtml(body, ctx);

      var path = get("notebook");
      if (path) {
        if (this.state.notebook) html += notebookHtml(this.state.notebook, path, title);
        else if (this.state.notebookError)
          html += '<p class="preview-note preview-error">No se pudo leer el notebook ' + esc(path) + ". Revisa que sea un archivo .ipynb.</p>";
        else html += '<p class="preview-note">Cargando el notebook…</p>';
      }
      html += "</div></article></div>";
      return h("div", { className: "container mt-1", dangerouslySetInnerHTML: { __html: html } });
    },
  });

  /* ------------------------------------------------------------------------------------------
   * 6. The "cells" editor for the post body
   *    Stored as plain markdown, so posts stay readable on GitHub:
   *      text   -> markdown (LaTeX allowed)          code   -> ```julia ... ```
   *      output -> ```output ... ```                 figure -> {% include figure.liquid path="..." caption="..." %}
   *      pdf    -> {% include pdf.liquid path="..." %}
   * ---------------------------------------------------------------------------------------- */
  var LANGUAGES = [
    ["python", "Python"],
    ["julia", "Julia"],
    ["wolfram", "Wolfram"],
    ["r", "R"],
    ["c", "C"],
    ["cpp", "C++"],
    ["java", "Java"],
    ["javascript", "JavaScript"],
    ["bash", "Bash"],
    ["latex", "LaTeX"],
    ["sql", "SQL"],
    ["haskell", "Haskell"],
    ["rust", "Rust"],
    ["text", "Texto plano"],
  ];
  var KINDS = { text: "Texto", code: "Código", output: "Salida", figure: "Figura", pdf: "PDF" };
  var FIGURE_SIZES = [
    ["", "Ancho completo"],
    ["75%", "75 %"],
    ["50%", "50 %"],
    ["35%", "35 %"],
  ];

  // PDFs added in the editor go to assets/pdf: the "pdf" sub-field of the body field in
  // admin/config.yml says so (Decap finds folders by the exact field from the configuration)
  function pdfField(bodyField) {
    var sub = bodyField && bodyField.get && bodyField.get("fields");
    var found =
      sub &&
      sub.find(function (f) {
        return f.get("name") === "pdf";
      });
    return found || bodyField;
  }

  var cellCounter = 0;
  function newCell(type, fields) {
    cellCounter += 1;
    var cell = { id: "c" + cellCounter, type: type };
    if (type === "text") cell.text = "";
    if (type === "code") {
      cell.lang = "python";
      cell.code = "";
    }
    if (type === "output") cell.text = "";
    if (type === "figure") {
      cell.path = "";
      cell.caption = "";
      cell.size = "";
      cell.args = {};
    }
    if (type === "pdf") {
      cell.path = "";
      cell.pages = "";
    }
    return Object.assign(cell, fields || {});
  }

  function parseCells(source) {
    var lines = String(source || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
    var cells = [];
    var text = [];
    var flush = function () {
      var joined = text
        .join("\n")
        .replace(/^\s*\n/, "")
        .replace(/\s+$/, "");
      if (joined) cells.push(newCell("text", { text: joined }));
      text = [];
    };
    var rawOpen = /^\{%-?\s*raw\s*-?%\}\s*$/;
    var rawClose = /^\{%-?\s*endraw\s*-?%\}\s*$/;
    for (var i = 0; i < lines.length; i++) {
      var start = i;
      var raw = false;
      if (rawOpen.test(lines[i]) && i + 1 < lines.length && /^(`{3,}|~{3,})/.test(lines[i + 1])) {
        raw = true;
        start = i + 1;
      }
      var fence = lines[start].match(/^(`{3,}|~{3,})\s*([^\s`]*)\s*$/);
      if (fence) {
        var close = new RegExp("^" + (fence[1][0] === "`" ? "`" : "~") + "{" + fence[1].length + ",}\\s*$");
        var k = start + 1;
        var body = [];
        while (k < lines.length && !close.test(lines[k])) body.push(lines[k++]);
        var end = k;
        var closed = k < lines.length;
        if (closed && raw) {
          if (end + 1 < lines.length && rawClose.test(lines[end + 1])) end += 1;
          else closed = false;
        }
        if (closed) {
          flush();
          var lang = fence[2];
          if (lang.toLowerCase() === "output") cells.push(newCell("output", { text: body.join("\n") }));
          else cells.push(newCell("code", { lang: lang, code: body.join("\n") }));
          i = end;
          continue;
        }
      }
      var figure = lines[i].match(/^\{%-?\s*include\s+figure\.liquid\s+(.*?)-?%\}\s*$/);
      if (figure) {
        flush();
        var args = parseArgs(figure[1]);
        var rest = {};
        args.__order.forEach(function (key) {
          if (["path", "caption", "max-width"].indexOf(key) === -1) rest[key] = args[key];
        });
        cells.push(newCell("figure", { path: args.path || "", caption: args.caption || "", size: args["max-width"] || "", args: rest }));
        continue;
      }
      var pdf = lines[i].match(/^\{%-?\s*include\s+pdf\.liquid\s+(.*?)-?%\}\s*$/);
      if (pdf) {
        flush();
        var pdfArgs = parseArgs(pdf[1]);
        cells.push(newCell("pdf", { path: pdfArgs.path || "", pages: pdfArgs.pages || "" }));
        continue;
      }
      text.push(lines[i]);
    }
    flush();
    return cells;
  }

  function quote(value) {
    value = String(value == null ? "" : value);
    if (value.indexOf('"') === -1) return '"' + value + '"';
    if (value.indexOf("'") === -1) return "'" + value + "'";
    return '"' + value.replace(/"/g, "”") + '"';
  }

  function fenced(lang, code) {
    var longest = 2;
    String(code).replace(/^\s*(`{3,})/gm, function (_, ticks) {
      longest = Math.max(longest, ticks.length);
      return "";
    });
    var fence = new Array(longest + 2).join("`");
    var block = fence + lang + "\n" + code.replace(/\s+$/, "") + "\n" + fence;
    // Jekyll runs Liquid before markdown: protect code that contains {{ or {%
    return /\{\{|\{%/.test(code) ? "{% raw %}\n" + block + "\n{% endraw %}" : block;
  }

  function serializeCells(cells) {
    var parts = cells
      .map(function (cell) {
        if (cell.type === "text") return String(cell.text || "").replace(/\s+$/, "");
        if (cell.type === "code") return cell.code.trim() || cell.lang ? fenced(cell.lang || "", cell.code || "") : "";
        if (cell.type === "output") return cell.text.trim() ? fenced("output", cell.text) : "";
        if (cell.type === "figure") {
          if (!cell.path) return "";
          var args = ["path=" + quote(cell.path)];
          if (cell.caption) args.push("caption=" + quote(cell.caption));
          if (cell.size) args.push("max-width=" + quote(cell.size));
          var rest = Object.assign({ class: "img-fluid rounded z-depth-1", zoomable: "true" }, cell.args || {});
          Object.keys(rest).forEach(function (key) {
            args.push(key + "=" + (rest[key] === "true" || rest[key] === "false" ? rest[key] : quote(rest[key])));
          });
          return "{% include figure.liquid " + args.join(" ") + " %}";
        }
        if (cell.type === "pdf") {
          if (!cell.path) return "";
          return "{% include pdf.liquid path=" + quote(cell.path) + (cell.pages === "single" ? ' pages="single"' : "") + " %}";
        }
        return "";
      })
      .filter(function (part) {
        return part !== "";
      });
    return parts.length ? parts.join("\n\n") + "\n" : "";
  }

  function autosize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 2 + "px";
  }

  var TEXT_TOOLS = [
    { label: "B", title: "Negrita", before: "**", after: "**", sample: "texto" },
    { label: "I", title: "Cursiva", before: "*", after: "*", sample: "texto" },
    { label: "H", title: "Subtítulo", line: "## ", sample: "Subtítulo" },
    { label: "$x$", title: "Fórmula en línea", before: "$", after: "$", sample: "x^2" },
    { label: "$$", title: "Fórmula centrada", before: "\n$$\n", after: "\n$$\n", sample: "\\int_0^1 f(x)\\,dx" },
    { label: "•", title: "Lista", line: "- ", sample: "elemento" },
    { label: "🔗", title: "Enlace", before: "[", after: "](https://)", sample: "texto del enlace" },
  ];

  var CellsControl = createClass({
    getInitialState: function () {
      this.controlID = "cells-" + Math.random().toString(36).slice(2);
      this.lastValue = this.props.value || "";
      this.textareas = {};
      return { cells: parseCells(this.props.value), mode: "cells", insertAfter: null, pending: {} };
    },

    componentDidMount: function () {
      this.resize();
    },

    // Decap only redraws a field when its value changes, unless the field says otherwise:
    // redraw also when a file chosen in the media library arrives (as Decap's own file field does)
    shouldComponentUpdate: function (nextProps, nextState) {
      if (nextState && nextState !== this.state) return true;
      var self = this;
      var paths = nextProps.mediaPaths;
      var arrived = Object.keys(this.state.pending).some(function (id) {
        return paths && paths.get && paths.get(self.controlID + "-" + id);
      });
      return (
        arrived ||
        nextProps.value !== this.props.value ||
        nextProps.getAsset !== this.props.getAsset ||
        nextProps.classNameWrapper !== this.props.classNameWrapper ||
        nextProps.hasActiveStyle !== this.props.hasActiveStyle
      );
    },

    componentDidUpdate: function (prevProps) {
      var value = this.props.value || "";
      if (value !== this.lastValue && value !== (prevProps.value || "")) {
        this.lastValue = value;
        this.setState({ cells: parseCells(value) });
      }
      // a file chosen in the media library arrives through mediaPaths
      var self = this;
      var mediaPaths = this.props.mediaPaths;
      if (mediaPaths && mediaPaths.get) {
        Object.keys(this.state.pending).forEach(function (cellId) {
          var chosen = mediaPaths.get(self.controlID + "-" + cellId);
          if (chosen) {
            var path = Array.isArray(chosen) ? chosen[0] : chosen.toJS ? chosen.toJS()[0] : chosen;
            var pending = Object.assign({}, self.state.pending);
            delete pending[cellId];
            self.setState({ pending: pending });
            self.update(cellId, { path: String(path) });
            self.props.onRemoveInsertedMedia(self.controlID + "-" + cellId);
          }
        });
      }
      this.resize();
    },

    // just-uploaded images come from Decap; images already on the site from the site
    assetUrl: function (path) {
      if (!path) return "";
      path = String(path);
      if (/^(https?:|data:|blob:)/.test(path)) return path;
      var clean = path.replace(/^\/+/, "");
      if (clean.indexOf("assets/img/posts/") === 0) {
        var url = assetUrl(this.props.getAsset(path, this.props.field));
        if (url) return url;
      }
      return "/" + clean;
    },

    resize: function () {
      var self = this;
      Object.keys(this.textareas).forEach(function (key) {
        if (self.textareas[key]) autosize(self.textareas[key]);
      });
    },

    emit: function (cells) {
      var value = serializeCells(cells);
      this.lastValue = value;
      this.props.onChange(value);
    },

    setCells: function (cells) {
      this.setState({ cells: cells });
      this.emit(cells);
    },

    update: function (id, changes) {
      this.setCells(
        this.state.cells.map(function (cell) {
          return cell.id === id ? Object.assign({}, cell, changes) : cell;
        })
      );
    },

    add: function (type, afterIndex) {
      var cells = this.state.cells.slice();
      var cell = newCell(type);
      var at = afterIndex == null ? cells.length : afterIndex + 1;
      cells.splice(at, 0, cell);
      this.setState({ cells: cells, insertAfter: null });
      this.emit(cells);
      var self = this;
      setTimeout(function () {
        var el = self.textareas[cell.id];
        if (el) el.focus();
        if (type === "figure" || type === "pdf") self.pick(cell);
      }, 30);
    },

    move: function (index, step) {
      var cells = this.state.cells.slice();
      var target = index + step;
      if (target < 0 || target >= cells.length) return;
      var moved = cells.splice(index, 1)[0];
      cells.splice(target, 0, moved);
      this.setCells(cells);
    },

    remove: function (index) {
      var cell = this.state.cells[index];
      var filled = (cell.text || cell.code || cell.path || "").trim();
      if (filled && !window.confirm("¿Borrar esta celda de " + KINDS[cell.type].toLowerCase() + "?")) return;
      var cells = this.state.cells.slice();
      cells.splice(index, 1);
      this.setCells(cells);
    },

    pick: function (cell) {
      var field = this.props.field;
      if (cell.type === "pdf") field = pdfField(field);
      var pending = Object.assign({}, this.state.pending);
      pending[cell.id] = true;
      this.setState({ pending: pending });
      this.props.onOpenMediaLibrary({
        controlID: this.controlID + "-" + cell.id,
        forImage: cell.type === "figure",
        allowMultiple: false,
        value: cell.path ? [cell.path] : [],
        field: field,
      });
    },

    tool: function (cell, tool) {
      var el = this.textareas[cell.id];
      var text = cell.text || "";
      var start = el ? el.selectionStart : text.length;
      var end = el ? el.selectionEnd : text.length;
      var chosen = text.slice(start, end) || tool.sample;
      var insert;
      if (tool.line) {
        var lineStart = text.lastIndexOf("\n", start - 1) + 1;
        text = text.slice(0, lineStart) + tool.line + text.slice(lineStart);
        start += tool.line.length;
        end += tool.line.length;
        if (start === end) {
          text = text.slice(0, start) + tool.sample + text.slice(end);
          end = start + tool.sample.length;
        }
      } else {
        insert = tool.before + chosen + tool.after;
        text = text.slice(0, start) + insert + text.slice(end);
        start += tool.before.length;
        end = start + chosen.length;
      }
      this.update(cell.id, { text: text });
      setTimeout(function () {
        if (el) {
          el.focus();
          el.setSelectionRange(start, end);
        }
      }, 20);
    },

    keyDown: function (cell, field) {
      var self = this;
      return function (event) {
        if (event.key !== "Tab" || event.shiftKey) return;
        event.preventDefault();
        var el = event.target;
        var value = el.value;
        var start = el.selectionStart;
        var changes = {};
        changes[field] = value.slice(0, start) + "    " + value.slice(el.selectionEnd);
        self.update(cell.id, changes);
        setTimeout(function () {
          el.setSelectionRange(start + 4, start + 4);
        }, 0);
      };
    },

    textarea: function (cell, field, className, placeholder) {
      var self = this;
      return h("textarea", {
        className: className,
        value: cell[field] || "",
        placeholder: placeholder,
        spellCheck: field === "text",
        rows: 3,
        ref: function (el) {
          self.textareas[cell.id] = el;
        },
        onChange: function (event) {
          var changes = {};
          changes[field] = event.target.value;
          self.update(cell.id, changes);
        },
        onKeyDown: field === "text" ? undefined : this.keyDown(cell, field),
        onFocus: this.props.setActiveStyle,
        onBlur: this.props.setInactiveStyle,
      });
    },

    addButtons: function (afterIndex) {
      var self = this;
      return Object.keys(KINDS).map(function (type) {
        return h(
          "button",
          {
            key: type,
            type: "button",
            className: "cells-add-btn",
            onClick: function () {
              self.add(type, afterIndex);
            },
          },
          "+ " + KINDS[type]
        );
      });
    },

    renderCell: function (cell, index) {
      var self = this;
      var count = this.state.cells.length;
      var head = [h("span", { key: "kind", className: "cell-kind" }, KINDS[cell.type])];
      if (cell.type === "code") {
        var known = LANGUAGES.some(function (pair) {
          return pair[0] === cell.lang;
        });
        head.push(
          h(
            "select",
            {
              key: "lang",
              className: "cell-lang",
              value: cell.lang || "",
              onChange: function (event) {
                self.update(cell.id, { lang: event.target.value });
              },
            },
            (known || !cell.lang ? [] : [[cell.lang, cell.lang]]).concat(LANGUAGES).map(function (pair) {
              return h("option", { key: pair[0], value: pair[0] }, pair[1]);
            })
          )
        );
      }
      if (cell.type === "text") {
        head.push(
          h(
            "span",
            { key: "tools", className: "cell-tools" },
            TEXT_TOOLS.map(function (tool) {
              return h(
                "button",
                {
                  key: tool.title,
                  type: "button",
                  title: tool.title,
                  className: "cell-tool",
                  onMouseDown: function (event) {
                    event.preventDefault();
                  },
                  onClick: function () {
                    self.tool(cell, tool);
                  },
                },
                tool.label
              );
            })
          )
        );
      }
      head.push(
        h(
          "span",
          { key: "actions", className: "cell-actions" },
          h("button", { type: "button", title: "Subir", disabled: index === 0, onClick: () => self.move(index, -1) }, "↑"),
          h("button", { type: "button", title: "Bajar", disabled: index === count - 1, onClick: () => self.move(index, 1) }, "↓"),
          h(
            "button",
            {
              type: "button",
              title: "Insertar una celda debajo",
              onClick: () => self.setState({ insertAfter: self.state.insertAfter === index ? null : index }),
            },
            "+"
          ),
          h("button", { type: "button", title: "Borrar la celda", className: "cell-delete", onClick: () => self.remove(index) }, "✕")
        )
      );

      var bodyParts = [];
      if (cell.type === "text") {
        bodyParts.push(this.textarea(cell, "text", "cell-text", "Escribe en Markdown. Fórmulas: $x^2$ en línea, $$ … $$ centradas."));
      } else if (cell.type === "code") {
        bodyParts.push(this.textarea(cell, "code", "cell-code", "Código (no se ejecuta aquí)"));
      } else if (cell.type === "output") {
        bodyParts.push(this.textarea(cell, "text", "cell-code cell-output", "Texto que imprimió el código (opcional)"));
      } else if (cell.type === "figure") {
        var src = this.assetUrl(cell.path);
        bodyParts.push(
          h(
            "div",
            { key: "figure", className: "cell-figure-body" },
            cell.path ? h("img", { src: src, alt: "" }) : h("div", { className: "cell-empty" }, "Sin imagen"),
            h(
              "div",
              { className: "cell-figure-fields" },
              h(
                "button",
                { type: "button", className: "cells-add-btn", onClick: () => self.pick(cell) },
                cell.path ? "Cambiar imagen…" : "Elegir imagen…"
              ),
              h("input", {
                type: "text",
                className: "cell-input",
                placeholder: "Pie de figura (opcional, admite $LaTeX$)",
                value: cell.caption || "",
                onChange: (event) => self.update(cell.id, { caption: event.target.value }),
              }),
              h(
                "select",
                { className: "cell-lang", value: cell.size || "", onChange: (event) => self.update(cell.id, { size: event.target.value }) },
                FIGURE_SIZES.map((pair) => h("option", { key: pair[0], value: pair[0] }, pair[1]))
              ),
              cell.path ? h("code", { className: "cell-path" }, cell.path) : null
            )
          )
        );
      } else if (cell.type === "pdf") {
        bodyParts.push(
          h(
            "div",
            { key: "pdf", className: "cell-figure-fields" },
            h("button", { type: "button", className: "cells-add-btn", onClick: () => self.pick(cell) }, cell.path ? "Cambiar PDF…" : "Elegir PDF…"),
            h(
              "select",
              { className: "cell-lang", value: cell.pages || "", onChange: (event) => self.update(cell.id, { pages: event.target.value }) },
              h("option", { value: "" }, "Varias páginas"),
              h("option", { value: "single" }, "Una página (póster)")
            ),
            cell.path ? h("code", { className: "cell-path" }, cell.path) : h("span", { className: "cell-empty" }, "Sin archivo")
          )
        );
      }

      return h(
        "div",
        { key: cell.id, className: "cell-card cell-type-" + cell.type },
        h("div", { className: "cell-head" }, head),
        h("div", { className: "cell-body" }, bodyParts),
        this.state.insertAfter === index ? h("div", { className: "cells-insert" }, this.addButtons(index)) : null
      );
    },

    render: function () {
      var self = this;
      var mode = this.state.mode;
      var switcher = h(
        "div",
        { className: "cells-mode" },
        h(
          "button",
          {
            type: "button",
            className: mode === "cells" ? "active" : "",
            onClick: function () {
              if (mode !== "cells") self.setState({ mode: "cells", cells: parseCells(self.props.value) });
            },
          },
          "Celdas"
        ),
        h(
          "button",
          {
            type: "button",
            className: mode === "markdown" ? "active" : "",
            onClick: function () {
              self.setState({ mode: "markdown" });
            },
          },
          "Markdown"
        )
      );

      if (mode === "markdown") {
        return h(
          "div",
          { className: "cells-editor " + (this.props.classNameWrapper || ""), id: this.props.forID },
          switcher,
          h("textarea", {
            className: "cell-code cells-markdown",
            value: this.props.value || "",
            spellCheck: false,
            ref: function (el) {
              self.textareas.__markdown = el;
            },
            onChange: function (event) {
              self.lastValue = event.target.value;
              self.props.onChange(event.target.value);
            },
          })
        );
      }

      var cells = this.state.cells;
      return h(
        "div",
        { className: "cells-editor " + (this.props.classNameWrapper || ""), id: this.props.forID },
        switcher,
        cells.length
          ? cells.map(function (cell, index) {
              return self.renderCell(cell, index);
            })
          : h("p", { className: "cells-empty" }, "Sin contenido todavía. Añade una celda (en una entrada con notebook puede quedar vacío)."),
        h("div", { className: "cells-add" }, h("span", null, "Añadir:"), this.addButtons(null))
      );
    },
  });

  /* ------------------------------------------------------------------------------------------
   * 7. Before saving
   * ---------------------------------------------------------------------------------------- */
  function beforeSave(event) {
    var data = event.entry.get("data");
    var sidebar = data.getIn(["toc", "sidebar"]);
    if (data.get("notebook") && !sidebar) data = data.setIn(["toc", "sidebar"], "left");
    else if (!sidebar && data.has("toc")) data = data.delete("toc");
    var tags = data.get("tags");
    if (typeof tags === "string") data = data.set("tags", tags.replace(/,/g, " ").replace(/\s+/g, " ").trim());
    // a blank line between the front matter and the text (the repository's Prettier check wants it)
    var body = data.get("body");
    if (typeof body === "string" && body.trim()) data = data.set("body", "\n" + body.replace(/^(\s*\n)+/, ""));
    return data;
  }

  /* ------------------------------------------------------------------------------------------ */
  addThemeButton();
  window.addEventListener("panel-theme", function () {
    document.querySelectorAll(".panel-theme-toggle").forEach(function (button) {
      var dark = Theme.get() === "dark";
      button.innerHTML = dark ? SUN : MOON;
    });
  });

  CMS.registerPreviewStyle(
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
  );
  CMS.registerPreviewStyle("/assets/css/bootstrap.min.css");
  CMS.registerPreviewStyle("https://cdn.jsdelivr.net/npm/mdbootstrap@4.20.0/css/mdb.min.css");
  CMS.registerPreviewStyle("/assets/css/main.css");
  CMS.registerPreviewStyle("/admin/preview.css");
  CMS.registerPreviewTemplate("posts", PostPreview);
  CMS.registerWidget("cells", CellsControl);
  CMS.registerEventListener({ name: "preSave", handler: beforeSave });

  // for tests in the browser console
  window.SitePanel = {
    protectMath: protectMath,
    markdownHtml: markdownHtml,
    parseCells: parseCells,
    serializeCells: serializeCells,
    notebookHtml: notebookHtml,
    notebookWords: notebookWords,
  };

  CMS.init();
})();
