/* ------------------------------------------------------------------
   daynight.js — scroll position as time of day.

   The whole feature is one number. This writes --sun on <body>: 0 at
   the top of <main>, 1 at the bottom of it. case-study.css does the
   rest, blending four phase palettes along that number, so nothing
   here knows or cares what colour anything is.

   The arc is measured against <main> rather than the document on
   purpose. The closing night band and the footer below it are the
   arrival, not part of the run — the light has to have finished going
   by the time the reader reaches them, or the band lands on a page
   that is still mid-afternoon.

   Enhancement only. Without it the page sits at the midday stop, which
   is the palette the rest of the site ships.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var body = document.querySelector("body.cycle");
  var main = document.getElementById("main");
  if (!body || !main) return;

  /* A colour ramp tied to the scrollbar is an animation, whatever else
     it is. Leave the page at the midday stop the stylesheet already
     defaults to, and do not attach anything. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var span = 1;
  var last = -1;
  var queued = false;

  function measure() {
    var bottom = main.getBoundingClientRect().bottom + window.scrollY;
    span = Math.max(1, bottom - window.innerHeight);
  }

  function paint() {
    queued = false;

    var p = window.scrollY / span;
    p = p < 0 ? 0 : p > 1 ? 1 : p;

    /* Three decimals is finer than the eye can pick out of a colour
       ramp, and rounding to it keeps a fast scroll from restyling the
       document on every pixel it passes. */
    p = Math.round(p * 1000) / 1000;
    if (p === last) return;
    last = p;

    body.style.setProperty("--sun", String(p));
  }

  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  function remeasure() {
    measure();
    last = -1;   // the same scroll position now means a different time
    request();
  }

  measure();
  paint();

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", remeasure);

  /* Six of the seven captures on this page are lazy, so <main> is
     shorter at first paint than it will be a moment later. Watching
     the element re-measures when the height actually changes, rather
     than guessing at load. */
  if (window.ResizeObserver) {
    new ResizeObserver(remeasure).observe(main);
  } else {
    window.addEventListener("load", remeasure);
  }
})();
