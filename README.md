# Singing Exhibition

A simple static site for a singing exhibition. Pick a genre — **Pop, Classical/Opera,
Jazz, Rock, Country** — and listen to 30-second YouTube clips of each song. Voting is
done on paper, so nothing is tracked here.

## View it

Hosted on GitHub Pages (link appears in the repo's **Settings → Pages** once enabled).

To run locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Adding / editing songs

All songs live in `js/app.js` in the `GENRES` list. Each entry looks like:

```js
{ title: "Song Name — Artist", youtubeId: "VIDEO_ID", start: 60, end: 90 }
```

- **youtubeId** — the part after `v=` in a YouTube URL (e.g. `dQw4w9WgXcQ`).
- **start / end** — in **seconds**. Clips are 30 seconds (e.g. `start: 60, end: 90`).
- **title** — optional; if omitted, the real YouTube title is shown automatically.
- **fadeIn / fadeOut** — optional, in seconds. Defaults to `DEFAULT_FADE` (2s).

### A note on YouTube embedding

Some videos (often official VEVO / label channels) disable embedding and will show
"Video unavailable" on the site even though they play on YouTube. To test a video before
adding it, open `https://www.youtube.com/embed/VIDEO_ID` in a browser — if it plays there,
it will embed here.

## Structure

- `index.html` — page markup (genre buttons + video grid)
- `css/styles.css` — styling
- `js/app.js` — song list + player logic (YouTube IFrame API, with volume fades)
