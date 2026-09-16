# Minutes and ordinance search

You can run this as its own page, or copy it into a site you already have.

Type a word. Click a row. Read the minutes or ordinance. Add your own
records on the page. Change the village name. Download the folder and
drop it into your project.

The Village of Minerva, Ohio text is sample data so the page is not empty
on first open. Names, street, and phone are fake. Email is on `.example`.

## Who it is for

A clerk window, or anyone who keeps minutes and ordinances and needs to
find one by typing a word. You do not have to use the Minerva sample. Put
your town and your records in, then host the folder with the rest of your
site.

## What you get

The whole tool is the files in `site/public/`. Keep them in one folder.

- `index.html` - the page
- `styles.css` - clerk-window look
- `app.js` - search, add, edit, download
- `records.json` - desk name plus the minutes and ordinances
- `README.txt` - short copy-this-folder note (also inside the zip)

No account. Nothing sends mail. These copies are not certified.

## Use it in your own project

You need those files next to each other. You do not need Node on the site
that hosts them.

**From this repo**

1. Copy the `site/public/` folder into your project. Name it whatever you
   want (`minutes/`, `clerk/`, `public/` is fine).
2. Keep `index.html`, `styles.css`, `app.js`, and `records.json` in that
   same folder.
3. Point your usual static files at that folder.
4. Open that path in the browser, for example `/minutes/`.

Example layout:

```
your-site/minutes/index.html
your-site/minutes/styles.css
your-site/minutes/app.js
your-site/minutes/records.json
```

**From the running page**

1. Open this tool, change **This desk**, add your records.
2. Click **Download folder**.
3. Unzip `minutes-search.zip`.
4. Copy the `minutes/` folder it contains into your project.
   `records.json` in that zip already has what you typed.

**JSON only**

If the HTML, CSS, and JS are already in your project, click
**Download JSON only** and replace `records.json` in that folder. Or use
**Load JSON** to bring a file back into the page.

## Make it yours

On the page:

1. **This desk** - village line, street, phone, email, hours.
2. **Add a record** - kind, number, date, title, text.
3. Click a row to **Edit** or **Remove**.
4. **Download folder** (or **Download JSON only**).

In the files:

- Edit `records.json` in a text editor if you would rather not use the
  form.
- Restyle `styles.css` if you want. The page does not call a framework.

**Restore sample records** puts the Minerva starter list back in this
browser only. It does not change the copy you already dropped into your
site.

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
