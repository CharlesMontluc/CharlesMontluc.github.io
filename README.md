# charlesmontluc.github.io

Personal website of Charles Montluc-Giannopoulou — AIDAMS student at CentraleSupélec & ESSEC.

Live at **https://charlesmontluc.github.io**

## Stack

Plain HTML, CSS and JavaScript. No framework and no build step: GitHub Pages serves the files as they are.

```
index.html          the whole site
404.html            not-found page
assets/css/         styles (dark and light themes)
assets/js/          name transliteration, theme toggle, scroll reveal
assets/img/         favicon and portrait
```

## Updating

- **Portrait:** add a square photo at `assets/img/photo.jpg` (at least 600×600). Until it exists, the site shows a monogram.
- **Content:** everything is in `index.html`, one `<section>` per part.
- **Preview locally:** `python3 -m http.server` then open http://localhost:8000.
