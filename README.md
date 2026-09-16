# Minutes and ordinance search

A small search page you can drop into your own site. Type a word, click a
row, read the minutes or ordinance. Add records on the page. Download the
folder when you want a copy to keep.

The Village of Minerva, Ohio text is sample data so the page is not empty
on first open. Names, street, and phone are fake. Email is on `.example`.

## What you get

Four files in `site/public/`. That folder is the whole tool.

- `index.html` - the page
- `styles.css` - clerk-window look
- `app.js` - search, add, edit, download
- `records.json` - your minutes and ordinances, plus the desk name

No account. Nothing sends mail. These copies are not certified.

## Add it to your project

Copy `site/public/` into your site. Example:

```
your-site/minutes/index.html
your-site/minutes/styles.css
your-site/minutes/app.js
your-site/minutes/records.json
```

Keep those files in the same folder. Point your usual static files at
that folder. Then open `/minutes/`.

Or run this repo, use the page, click **Download folder**. That zip is
the same four files with whatever you typed baked into `records.json`.
Unzip it and drop the `minutes/` folder into your project.

You do not need Node on the site that hosts it.

## Make it yours

1. Change **This desk** to your village, street, phone, and email.
2. Add minutes and ordinances with **Add a record**.
3. Click **Download folder** (or **Download JSON only** if you already
   have the HTML/CSS/JS).
4. Replace `records.json` in your copy with the file you downloaded.

Restore sample records if you want the Minerva starter list back.

## Try it here first

```
npm start
```

Leave that process running. Open:

http://127.0.0.1:46173/

## Demo

https://github.com/user-attachments/assets/ca122144-8a9a-4ece-a3b3-756cbf9d6a53

Repo copy: [docs/media/minutes-demo.mp4](docs/media/minutes-demo.mp4)

Voice is Microsoft Andrew Neural. Music is Wallpaper by Kevin MacLeod (incompetech.com), CC BY 3.0.

## Unfinished

Does not search a live .gov. Does not stamp a certified copy. Does not
upload PDFs. Does not sync across computers unless you move the JSON
file. Opening `index.html` by double-click (no server) will not load
`records.json`. GitHub Pages is not on yet.
