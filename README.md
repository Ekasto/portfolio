# portfolio

Personal portfolio site — a static page served by GitHub Pages.

## Layout

```
index.html               the landing page
work/<slug>/index.html   one case study per game
tools/<slug>/index.html  one case study per shipped tool
assets/css/tokens.css    colour, type scale, spacing — light + dark
assets/css/site.css      components; mobile-first, desktop at 900px
assets/css/case-study.css  Silbo's landscape case-study skin
assets/css/crack-painter.css  Crack Painter's independent project design
assets/js/shatter.js     home-page fracture transition into Crack Painter
assets/js/crack-painter.js  optional sample, video and screenshot interactions
assets/img/<slug>/       that project's captures
assets/images/crack-painter-2d/  original Asset Store screenshots and videos
```

Projects can have their own visual identity while remaining part of the
portfolio. Silbo uses landscape bands; Crack Painter uses an editor-inspired
workbench, magenta fracture lines, and its own typography and layout. Both
link back to the portfolio and share the saved colour-theme preference.

Opening Crack Painter from its home-page title, image or breakdown link
briefly shatters the visible home page to reveal the project. The effect uses
inert DOM fragments over a temporary same-origin preview, then completes an
ordinary navigation. Reduced-motion settings and unsupported browsers use
the link directly. Returning with Back cleans up the transition.

Crack Painter's original screenshots and videos come from its
[Unity Asset Store listing](https://assetstore.unity.com/packages/tools/sprite-management/crack-painter-2d-sprite-shatter-break-tool-395136).
Videos play on request; the interactive wall is a web illustration, with
actual Unity footage shown separately. Full-size screenshots use a native
dialog, and all project content remains available without JavaScript.

No build step: the files as committed are the files served.

## Preview locally

```
npx serve .        # or: python -m http.server 8000
```

## Publish

Settings -> Pages -> Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
