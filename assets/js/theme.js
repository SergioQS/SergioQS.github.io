// Dark-only theme: always apply dark, keep renderer sync for libraries.

let applyTheme = () => {
  const theme = "dark";

  setHighlight(theme);
  setGiscusTheme(theme);
  setSearchTheme(theme);

  if (typeof mermaid !== "undefined") {
    setMermaidTheme(theme);
  }
  if (typeof Diff2HtmlUI !== "undefined") {
    setDiff2htmlTheme(theme);
  }
  if (typeof echarts !== "undefined") {
    setEchartsTheme(theme);
  }
  if (typeof Plotly !== "undefined") {
    setPlotlyTheme(theme);
  }
  if (typeof vegaEmbed !== "undefined") {
    setVegaLiteTheme(theme);
  }

  document.documentElement.setAttribute("data-theme", "dark");

  let tables = document.getElementsByTagName("table");
  for (let i = 0; i < tables.length; i++) {
    tables[i].classList.add("table-dark");
  }

  if (typeof medium_zoom !== "undefined") {
    medium_zoom.update({
      background:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--global-bg-color",
        ) + "ee",
    });
  }
};

let setHighlight = (theme) => {
  const light = document.getElementById("highlight_theme_light");
  const dark = document.getElementById("highlight_theme_dark");
  if (light) light.media = "none";
  if (dark) dark.media = "";
};

let setGiscusTheme = (theme) => {
  const iframe = document.querySelector("iframe.giscus-frame");
  if (!iframe) return;
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme: theme } } },
    "https://giscus.app",
  );
};

let addMermaidZoom = (records, observer) => {
  var svgs = d3.selectAll(".mermaid svg");
  svgs.each(function () {
    var svg = d3.select(this);
    svg.html("<g>" + svg.html() + "</g>");
    var inner = svg.select("g");
    var zoom = d3.zoom().on("zoom", function (event) {
      inner.attr("transform", event.transform);
    });
    svg.call(zoom);
  });
  observer.disconnect();
};

let setMermaidTheme = (theme) => {
  document.querySelectorAll(".mermaid").forEach((elem) => {
    let svgCode = elem.previousSibling.childNodes[0].innerHTML;
    elem.removeAttribute("data-processed");
    elem.innerHTML = svgCode;
  });
  mermaid.initialize({ theme: theme });
  window.mermaid.init(undefined, document.querySelectorAll(".mermaid"));

  const observable = document.querySelector(".mermaid svg");
  if (observable !== null) {
    var observer = new MutationObserver(addMermaidZoom);
    observer.observe(observable, { childList: true });
  }
};

let setDiff2htmlTheme = (theme) => {
  document.querySelectorAll(".diff2html").forEach((elem) => {
    let textData = elem.previousSibling.childNodes[0].innerHTML;
    elem.innerHTML = "";
    const configuration = {
      colorScheme: theme,
      drawFileList: true,
      highlight: true,
      matching: "lines",
    };
    const diff2htmlUi = new Diff2HtmlUI(elem, textData, configuration);
    diff2htmlUi.draw();
  });
};

let setEchartsTheme = (theme) => {
  document.querySelectorAll(".echarts").forEach((elem) => {
    let jsonData = elem.previousSibling.childNodes[0].innerHTML;
    echarts.dispose(elem);
    var chart = echarts.init(elem, "dark-fresh-cut");
    chart.setOption(JSON.parse(jsonData));
  });
};

let setPlotlyTheme = (theme) => {
  document.querySelectorAll(".js-plotly-plot").forEach((elem) => {
    let jsonData = JSON.parse(elem.previousSibling.childNodes[0].innerHTML);
    // prettier-ignore
    const plotlyDarkLayout = { "layout": { "autotypenumbers": "strict", "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": { "color": "#f2f5fa" }, "hovermode": "closest", "hoverlabel": { "align": "left" }, "paper_bgcolor": "rgb(17,17,17)", "plot_bgcolor": "rgb(17,17,17)", "polar": { "bgcolor": "rgb(17,17,17)", "angularaxis": { "gridcolor": "#506784", "linecolor": "#506784", "ticks": "" }, "radialaxis": { "gridcolor": "#506784", "linecolor": "#506784", "ticks": "" } }, "ternary": { "bgcolor": "rgb(17,17,17)", "aaxis": { "gridcolor": "#506784", "linecolor": "#506784", "ticks": "" }, "baxis": { "gridcolor": "#506784", "linecolor": "#506784", "ticks": "" }, "caxis": { "gridcolor": "#506784", "linecolor": "#506784", "ticks": "" } }, "coloraxis": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "xaxis": { "gridcolor": "#283442", "linecolor": "#506784", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "#283442", "automargin": true, "zerolinewidth": 2 }, "yaxis": { "gridcolor": "#283442", "linecolor": "#506784", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "#283442", "automargin": true, "zerolinewidth": 2 }, "scene": { "xaxis": { "backgroundcolor": "rgb(17,17,17)", "gridcolor": "#506784", "linecolor": "#506784", "showbackground": true, "ticks": "", "zerolinecolor": "#C8D4E3", "gridwidth": 2 }, "yaxis": { "backgroundcolor": "rgb(17,17,17)", "gridcolor": "#506784", "linecolor": "#506784", "showbackground": true, "ticks": "", "zerolinecolor": "#C8D4E3", "gridwidth": 2 }, "zaxis": { "backgroundcolor": "rgb(17,17,17)", "gridcolor": "#506784", "linecolor": "#506784", "showbackground": true, "ticks": "", "zerolinecolor": "#C8D4E3", "gridwidth": 2 } }, "shapedefaults": { "line": { "color": "#f2f5fa" } }, "annotationdefaults": { "arrowcolor": "#f2f5fa", "arrowhead": 0, "arrowwidth": 1 }, "geo": { "bgcolor": "rgb(17,17,17)", "landcolor": "rgb(17,17,17)", "subunitcolor": "#506784", "showland": true, "showlakes": true, "lakecolor": "rgb(17,17,17)" }, "title": { "x": 0.05 }, "mapbox": { "style": "dark" } } };

    if (jsonData.layout) {
      jsonData.layout.template = jsonData.layout.template
        ? { ...plotlyDarkLayout, ...jsonData.layout.template }
        : plotlyDarkLayout;
    } else {
      jsonData.layout = { template: plotlyDarkLayout };
    }

    Plotly.relayout(elem, jsonData.layout);
  });
};

let setVegaLiteTheme = (theme) => {
  document.querySelectorAll(".vega-lite").forEach((elem) => {
    let jsonData = elem.previousSibling.childNodes[0].innerHTML;
    elem.innerHTML = "";
    vegaEmbed(elem, JSON.parse(jsonData), { theme: "dark" });
  });
};

let setSearchTheme = (theme) => {
  const ninjaKeys = document.querySelector("ninja-keys");
  if (!ninjaKeys) return;
  ninjaKeys.classList.add("dark");
};

// Initialize: set dark theme immediately to avoid FOUC.
document.documentElement.setAttribute("data-theme", "dark");
document.documentElement.setAttribute("data-theme-setting", "dark");
applyTheme();
