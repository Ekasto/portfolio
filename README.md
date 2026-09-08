# portfolio

Personal portfolio site — a static page served by GitHub Pages.

## Layout

```
index.html               the landing page
work/<slug>/index.html   one case study per game
tools/<slug>/index.html  one case study per shipped tool
assets/css/tokens.css    colour, type scale, spacing — light + dark
assets/css/site.css      components; mobile-first, desktop at 900px
assets/css/case-study.css  the case-study skin: per-project palette + bands
assets/img/<slug>/       that project's captures
```

Every case study reuses the site chrome and fills one small contract in
`case-study.css` — an ink colour, a band colour, and the two full-bleed
bands that open and close the page — so a new one is a palette and a page,
not a new stylesheet. The band artwork is an SVG `<defs>` block in the page
itself, placed twice by `<use>`: Silbo opens on a sunset ridgeline and closes
on the same ridgeline after dark; Crack Painter opens on a slab with the
cracks painted on and closes on those same pieces, broken.

No build step: the files as committed are the files served.

## Preview locally

```
npx serve .        # or: python -m http.server 8000
```

## Publish

Settings -> Pages -> Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
