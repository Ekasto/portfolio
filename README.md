# portfolio

Personal portfolio site — a static page served by GitHub Pages.

## Layout

```
index.html              the landing page
work/<slug>/index.html  one case study per game
assets/css/tokens.css   colour, type scale, spacing — light + dark
assets/css/site.css     components; mobile-first, desktop at 900px
assets/css/game.css     the case-study skin: per-game palette + ranges
assets/img/<slug>/      that game's captures
```

Each game page reuses the site chrome and overrides one block of `--game-*`
colours in `game.css`, so a new game is a palette and a page, not a new
stylesheet. The mountain ranges that open and close a case study are one
shared SVG path set, recoloured per game.

No build step: the files as committed are the files served.

## Preview locally

```
npx serve .        # or: python -m http.server 8000
```

## Publish

Settings -> Pages -> Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
