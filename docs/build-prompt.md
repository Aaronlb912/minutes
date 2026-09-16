# TARGET 2026-09-15

Minutes and ordinance search. Type a word. The list filters live. Click a
row and read the record. Add and edit on the page. Download the folder
and drop it into another site.

Local URL: http://127.0.0.1:46173/

Pages:
- `/` search, record panel, add/edit, desk fields, downloads. No other
  routes.

Auth: none.

Sample: Village of Minerva, Ohio clerk desk. Names, street, and phone are
fake. Email is on `.example`. Starter records in `site/public/records.json`.

Done:
- Open the page in a browser.
- Empty box shows the full list.
- Type a word that hits. Click a row. Read the body.
- Type a miss. See "no records match."
- Clear it. The list comes back.
- Add a record. Edit the desk name. Download folder.

## Usefulness check

1. Who else? A clerk, or anyone who keeps minutes and ordinances and
   needs to find one by typing a word.
2. Their data? Yes. Add, edit, remove on the page. Or edit
   `records.json`. Load JSON.
3. Make it theirs? Yes. **This desk** changes village, street, phone,
   email, hours. CSS is in the folder if they want a different look.
4. Take it? Yes. Copy `site/public/`, or **Download folder**
   (`minutes-search.zip`).
5. No account? Yes. Static files. No signup.
6. Coworker test? Yes. Send the zip. They put `minutes/` on their site
   or any static server.
7. Keep a copy? Yes. Download folder or Download JSON only.
8. Miss and recover? Yes. Empty add form asks for number, date, title,
   text. Bad search says no match. Then a real word or a filled form.
9. README says how? Yes. Who, what, copy-the-folder, download-the-folder,
   change the desk, add records.
