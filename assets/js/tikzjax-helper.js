(function () {
  var MAX_RENDER_RETRIES = 12;
  var RENDER_RETRY_DELAY = 350; // ms

  // Recursively query document + open shadow roots for selector
  function deepQuerySelectorAll(selector) {
    var results = [];
    // helper: process a root (document or shadowRoot)
    function collect(root) {
      try {
        if (root.querySelectorAll) {
          var found = root.querySelectorAll(selector);
          for (var i = 0; i < found.length; i++) results.push(found[i]);
        }
      } catch (e) {
        // ignore
      }
      // find elements that may have open shadow roots
      var all;
      try { all = root.querySelectorAll('*'); } catch (ex) { all = []; }
      for (var j = 0; j < all.length; j++) {
        var el = all[j];
        if (el.shadowRoot) {
          collect(el.shadowRoot);
        }
      }
    }
    collect(document);
    return results;
  }

  function addStyles() {
    if (document.getElementById('tikzjax-override-styles')) return;
    var style = document.createElement('style');
    style.id = 'tikzjax-override-styles';
    var css = ''
      + '.tikzjax-box{display:block!important;width:100%!important;text-align:center;margin:1rem 0!important;padding:0.6rem!important;border-radius:8px;background:white!important;box-shadow:0 6px 18px rgba(0,0,0,0.08);box-sizing:border-box;overflow:visible!important;}'
      + 'svg.tikzjax,.tikzjax-box svg{display:block!important;margin:0 auto!important;max-width:100%!important;width:100%!important;height:auto!important;min-height:100px!important;background:white!important;filter:none!important;-webkit-filter:none!important;box-sizing:border-box!important;}'
      + 'svg.tikzjax text,svg.tikzjax tspan,.tikzjax-box svg text,.tikzjax-box svg tspan{fill:#000!important;color:#000!important;stroke:none!important;}'
      + '.tikzjax-box svg{line-height:normal!important;}'
      + '@media (max-width:700px){svg.tikzjax,.tikzjax-box svg{min-height:80px!important;}}';
    try { style.appendChild(document.createTextNode(css)); } catch (e) { style.innerText = css; }
    document.head.appendChild(style);
  }

  // create or find a light-DOM container near host to preserve tikz source
  function ensureLightContainerForHost(hostEl, tikzSource) {
    // Try to reuse an existing container adjacent to host
    var container = null;
    if (hostEl && hostEl.parentNode) {
      // search siblings for existing .tikzjax-box
      var siblings = hostEl.parentNode.children;
      for (var i = 0; i < siblings.length; i++) {
        if (siblings[i].classList && siblings[i].classList.contains('tikzjax-box')) {
          container = siblings[i];
          break;
        }
      }
      if (!container) {
        container = document.createElement('div');
        container.className = 'tikzjax-box';
        hostEl.parentNode.insertBefore(container, hostEl.nextSibling);
      }
    } else {
      // fallback: append to body
      container = document.createElement('div');
      container.className = 'tikzjax-box';
      document.body.appendChild(container);
    }
    if (tikzSource) container.dataset.tikz = tikzSource.trim();
    return container;
  }

  // Wrap script nodes found anywhere (including shadow roots) by creating a light-DOM container and preserving source
  function wrapScripts() {
    // find scripts in document + shadow roots
    var scripts = deepQuerySelectorAll('script[type="text/tikz"]');
    var count = 0;
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      // find host element if script is inside a shadow root
      var host = null;
      try {
        var root = script.getRootNode ? script.getRootNode() : null;
        if (root && root.host) host = root.host;
      } catch (e) { host = null; }

      var source = (script.textContent || script.innerText || '').trim();
      // If script is already inside a lightDOM .tikzjax-box, ensure data attribute
      if (script.parentElement && script.parentElement.classList && script.parentElement.classList.contains('tikzjax-box')) {
        if (source) script.parentElement.dataset.tikz = source;
        count++;
        continue;
      }

      // create/ensure a light dom container near host
      var container = ensureLightContainerForHost(host || script.parentNode, source);
      // preserve source in a template and data attribute
      try {
        var tpl = document.createElement('template');
        tpl.className = 'tikzjax-preserve';
        tpl.dataset.tikz = source;
        tpl.innerHTML = '<!-- tikz source preserved -->';
        container.appendChild(tpl);
      } catch (e) { /* ignore */ }

      // if script already in light DOM, try to move it inside container for tikzjax to find
      try {
        if (script.parentNode && script.parentNode.nodeType === 1) {
          container.appendChild(script);
        }
      } catch (e) { /* ignore moving errors */ }

      // also ensure the container has the dataset for recreation
      if (source) container.dataset.tikz = source;
      count++;
    }
    if (console && console.info) console.info('tikzjax-helper: wrapped scripts found:', count);
    return count;
  }

  function triggerTikzjaxRender() {
    if (!window.tikzjax) return false;
    try {
      if (typeof window.tikzjax.refresh === 'function') window.tikzjax.refresh();
      else if (typeof window.tikzjax.render === 'function') window.tikzjax.render();
      else if (typeof window.tikzjax.parse === 'function') window.tikzjax.parse();
      else if (console && console.info) console.info('tikzjax: no known render method on window.tikzjax');
      return true;
    } catch (e) {
      if (console && console.warn) console.warn('tikzjax render threw', e);
      return false;
    }
  }

  // post-process svgs; if none, try recreating script nodes from data-tikz
  function postProcessAndRetry(retry) {
    retry = retry || 0;
    addStyles();

    // broaden svg selectors: any svg inside .tikzjax-box OR svg.tikzjax
    var svgs = document.querySelectorAll('.tikzjax-box svg, svg.tikzjax');
    if (!svgs || svgs.length === 0) {
      // try to recreate scripts from containers that have data-tikz but no svg inside
      var boxes = document.querySelectorAll('.tikzjax-box');
      var created = 0;
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        if (box.querySelector && box.querySelector('svg')) continue;
        if (!box.dataset || !box.dataset.tikz) continue;
        if (box.dataset.tikzRendered === '1') continue;
        try {
          var s = document.createElement('script');
          s.type = 'text/tikz';
          s.textContent = box.dataset.tikz;
          s.dataset.generatedBy = 'tikzjax-helper';
          box.appendChild(s);
          created++;
        } catch (e) {
          if (console && console.warn) console.warn('Could not create script element for tikzjax:', e);
        }
        box.dataset.tikzRendered = '1';
      }

      if (created > 0) {
        // ask tikzjax to render then re-run postProcess
        window.setTimeout(function () {
          triggerTikzjaxRender();
          window.setTimeout(function () { postProcessAndRetry(retry + 1); }, 200);
        }, 100);
        return;
      }

      // If no scripts created and we still have retries, check whether scripts exist in shadow DOM and re-run later
      if (retry < MAX_RENDER_RETRIES) {
        window.setTimeout(function () { postProcessAndRetry(retry + 1); }, RENDER_RETRY_DELAY);
        return;
      }

      if (console && console.warn) console.warn('tikzjax: no svg found after retries; boxes=%d, scripts-in-shadow=%d, window.tikzjax=%s', boxes.length, deepQuerySelectorAll('script[type=\"text/tikz\"]').length, !!window.tikzjax);
      return;
    }
    svgs.forEach(function (svg) {
      try {
        // remove explicit height
        svg.removeAttribute('height');
        // always stretch to container
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
  
        // --- NEW: run the bbox centering ---
        centerSvgContentAndFit(svg);
  
      } catch (e) {
        console.warn('tikzjax postProcess failed:', e);
      }
    });
            // we have svgs: fix attributes AND attempt to center the drawing inside each svg
    // ---------- begin replacement ----------
    // helper to center the inner drawing by resetting viewBox to the content bbox
    function centerSvgContentAndFit(svg) {
      try {
        if (!svg || !svg.getBBox) return;
        var bbox = svg.getBBox();
        if (!bbox || bbox.width <= 0 || bbox.height <= 0) return;
    
        svg.setAttribute('viewBox', bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
        // force block centering
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        svg.style.width = 'auto';
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
    
        svg.style.background = 'white';
        var box = svg.closest('.tikzjax-box');
        if (box) box.style.background = 'white';
      } catch (e) {
        console.warn('centerSvgContentAndFit failed:', e);
      }
    }     // ---------- end replacement ----------
  }
  // main driver
  function tryRenderAll(retry) {
    retry = retry || 0;
    var found = wrapScripts();
    addStyles();

    // If tikzjax exists, trigger a render. If not yet, schedule retry.
    if (window.tikzjax) {
      triggerTikzjaxRender();
    } else if (retry < MAX_RENDER_RETRIES) {
      window.setTimeout(function () { tryRenderAll(retry + 1); }, RENDER_RETRY_DELAY);
      return;
    }

    // After asking tikzjax to render, allow a short wait then post-process
    window.setTimeout(function () { postProcessAndRetry(0); }, 140);
  }

  function init() {
    addStyles();
    wrapScripts();

    // initial attempt after a short delay
    window.setTimeout(function () { tryRenderAll(0); }, 220);

    // observe mutations (Distill may move content later into shadow roots)
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function (mutations) {
        var added = false;
        for (var m = 0; m < mutations.length; m++) {
          if (mutations[m].addedNodes && mutations[m].addedNodes.length > 0) { added = true; break; }
        }
        if (added) {
          window.setTimeout(function () { tryRenderAll(0); }, 260);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();