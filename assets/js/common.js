$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  // Create additional CSS to force light theme
  const lightThemeCSS = `
    <style>
      /* Force light theme for notebooks */
      body {
        background-color: white !important;
        color: black !important;
      }
      
      /* Override dark theme variables */
      :root {
        --jp-ui-font-color0: rgba(0, 0, 0, 1) !important;
        --jp-ui-font-color1: rgba(0, 0, 0, 0.87) !important;
        --jp-ui-font-color2: rgba(0, 0, 0, 0.54) !important;
        --jp-ui-font-color3: rgba(0, 0, 0, 0.38) !important;
        --jp-content-font-color0: rgba(0, 0, 0, 1) !important;
        --jp-content-font-color1: rgba(0, 0, 0, 0.87) !important;
        --jp-content-font-color2: rgba(0, 0, 0, 0.54) !important;
        --jp-content-font-color3: rgba(0, 0, 0, 0.38) !important;
        --jp-layout-color0: white !important;
        --jp-layout-color1: white !important;
        --jp-layout-color2: #e0e0e0 !important;
        --jp-layout-color3: #bdbdbd !important;
      }
      
      /* Override any dark theme classes */
      .jp-Notebook {
        background-color: white !important;
        color: black !important;
      }
      
      .jp-Cell {
        background-color: white !important;
        color: black !important;
      }
      
      .jp-InputArea {
        background-color: white !important;
      }
      
      .jp-OutputArea {
        background-color: white !important;
      }
      
      pre, code {
        background-color: #f5f5f5 !important;
        color: black !important;
      }
    </style>
  `;

  // Force notebooks to always use light theme regardless of site theme
  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);
    $(this).contents().find("head").append(lightThemeCSS);

    // Always force light theme for notebooks
    $(this).bind("load", function () {
      $(this).contents().find("body").attr({
        "data-jp-theme-light": "true",
        "data-jp-theme-name": "JupyterLab Light",
      });
      
      // Re-apply the light theme CSS after load
      $(this).contents().find("head").append(lightThemeCSS);
    });
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
