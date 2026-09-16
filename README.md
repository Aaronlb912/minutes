# Minutes and ordinance search

For a clerk window, or anyone who needs to find a village record by typing
a word. Clone the repo, start the page, search.

The Village of Minerva, Ohio pages in `site/public/` are a fixture. Names,
street, and phone are fake. Email is on `.example`.

## What you get

- `site/public/records.json` - minutes and ordinances
- A browser page that filters the list as you type
- Click a row to read the record on the right

No account. Nothing sends mail. These copies are not certified.

## Demo

REPO_VIDEO_URL_PLACEHOLDER

Repo copy: [docs/media/minutes-demo.mp4](docs/media/minutes-demo.mp4)

Voice is Microsoft Andrew Neural. Music is Wallpaper by Kevin MacLeod (incompetech.com), CC BY 3.0.

## Install

```
npm start
```

Leave that process running. Open:

http://127.0.0.1:46173/

## Unfinished

Does not search a live .gov. Does not stamp a certified copy. Does not
upload PDFs. GitHub Pages is not on yet.
