# portfolio

Personal portfolio site — a static page served by GitHub Pages.

## Layout

```
index.html              the landing page
assets/css/tokens.css   colour, type scale, spacing — light + dark
assets/css/site.css     components; mobile-first, desktop at 900px
assets/img/             site images (empty until real captures land)
```

No build step: the files as committed are the files served.

## Preview locally

```
npx serve .        # or: python -m http.server 8000
```

## Publish

Settings -> Pages -> Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
