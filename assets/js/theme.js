/* ------------------------------------------------------------------
   theme.js — the colour-theme toggle.

   Three states, cycled in this order:
     system  no data-theme attribute; follows prefers-color-scheme
     light   data-theme="light"
     dark    data-theme="dark"

   The choice is stored in localStorage. The matching attribute is
   applied before first paint by the inline script in index.html;
   this file only handles the button.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var STATES = ["system", "light", "dark"];
  var LABELS = { system: "System", light: "Light", dark: "Dark" };

  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  if (!button) return;

  var label = button.querySelector(".theme-toggle__label");

  function read() {
    try {
      var t = localStorage.getItem("theme");
      return t === "light" || t === "dark" ? t : "system";
    } catch (e) {
      return "system";
    }
  }

  function write(state) {
    try {
      if (state === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", state);
    } catch (e) {
      /* storage unavailable — the choice just won't outlive the page */
    }
  }

  /* Keep the mobile browser chrome in step with the palette on screen.
     The page ships two media-scoped theme-color metas that already do
     the right thing for "system"; an explicit choice has to override
     them, so swap in a single unscoped meta instead. */
  var override = null;

  function syncMeta(state) {
    if (state === "system") {
      if (override) {
        override.parentNode.removeChild(override);
        override = null;
      }
      return;
    }

    if (!override) {
      override = document.createElement("meta");
      override.name = "theme-color";
      // Browsers honour the first theme-color whose media matches, so
      // this has to sit ahead of the media-scoped pair to win.
      document.head.insertBefore(override, document.head.firstChild);
    }
    override.setAttribute("content", state === "dark" ? "#131312" : "#f6f5f2");
  }

  function apply(state) {
    if (state === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", state);

    if (label) label.textContent = LABELS[state];
    button.setAttribute(
      "aria-label",
      "Colour theme: " + LABELS[state].toLowerCase() + ". Activate to change."
    );
    syncMeta(state);
  }

  var current = read();
  apply(current);
  button.hidden = false;

  button.addEventListener("click", function () {
    current = STATES[(STATES.indexOf(current) + 1) % STATES.length];
    write(current);
    apply(current);
  });

  /* No listener for OS theme changes is needed: on "system" both the
     CSS and the media-scoped theme-color metas react on their own. */
})();
