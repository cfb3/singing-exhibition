/* ============================================================
   SONG LIST — this is the only part you need to edit to add songs.

   For each genre, add as many songs as you like.
   To get a video's YouTube ID:
     1. Open the video on YouTube.
     2. Look at the address bar, e.g.  https://www.youtube.com/watch?v=dQw4w9WgXcQ
     3. The ID is the part after "v="  ->  dQw4w9WgXcQ
   Paste that ID into "youtubeId" below.

   The "PLACEHOLDER" entries below will show an empty player until
   you replace the youtubeId with a real one.

   OPTIONAL: to play only part of a song, add "start" and/or "end"
   times in SECONDS. Example: start at 1:00 and stop at 1:30 ->
     { title: "...", youtubeId: "...", start: 60, end: 90 }

   OPTIONAL: the "title" is optional. If you leave it out, the card
   will automatically show the real video title from YouTube:
     { youtubeId: "...", start: 60, end: 90 }

   OPTIONAL: each clip fades its volume in at the start and out at
   the end. The default length is DEFAULT_FADE (below). Override per
   song with "fadeIn" / "fadeOut" in SECONDS (use 0 for no fade):
     { youtubeId: "...", start: 60, end: 90, fadeIn: 3, fadeOut: 4 }
   ============================================================ */

// Default fade length, in seconds, for every clip (override per song above).
const DEFAULT_FADE = 2;

const GENRES = {
  pop: {
    label: "Pop",
    songs: [
      { title: "Can't Stop the Feeling! — Justin Timberlake", youtubeId: "ru0K8uYEZWw", start: 60, end: 90 },
      { title: "Blank Space — Taylor Swift", youtubeId: "e-ORhEE9VVg", start: 40, end: 70 },
      { title: "Here Comes The Sun — The Beatles", youtubeId: "KQetemT1sWc", start: 40, end: 70 },
    ],
  },
  classical: {
    label: "Classical / Opera",
    songs: [
      { title: "Symphony No. 9 (Ode to Joy) — Beethoven", youtubeId: "fzyO3fLV5O0", start: 1185, end: 1215 },
      { title: "Nessun Dorma — Jonas Kaufmann", youtubeId: "xN-JCdM4or0", start: 137, end: 167 },
      { title: "Habanera (Carmen) — Elina Garanča", youtubeId: "K2snTkaD64U", start: 0, end: 30 },
    ],
  },
  jazz: {
    label: "Jazz",
    songs: [
      { title: "Nostalgia (The Day I Knew) — Samara Joy", youtubeId: "LvUidbMTKkU", start: 40, end: 70 },
      { title: "Summertime — Ella Fitzgerald", youtubeId: "u2bigf337aU", start: 7, end: 37 },
      { title: "What a Wonderful World — Louis Armstrong", youtubeId: "CaCSuzR4DwM", start: 4, end: 34 },
    ],
  },
  rock: {
    label: "Rock",
    songs: [
      { title: "Under Pressure — Queen & David Bowie", youtubeId: "WsuBBd9W4hk", start: 160, end: 200 },
      { title: "Dream On — Aerosmith", youtubeId: "iJDtukGW79Y", start: 130, end: 160 },
      { title: "Kashmir — Led Zeppelin", youtubeId: "ww9484EM2OQ", start: 235, end: 265 },
    ],
  },
  country: {
    label: "Country",
    songs: [
      { title: "Jolene — Dolly Parton", youtubeId: "Ixrje2rXLMA", start: 8, end: 38 },
      { title: "Breathe — Faith Hill", youtubeId: "yCmsZUN4r_s", start: 75, end: 105 },
      { title: "Ring of Fire — Johnny Cash", youtubeId: "1WaV2x8GXj0", start: 20, end: 50 },
    ],
  },
};

/* ============================================================
   Below here is the page logic — you usually won't need to change it.
   ============================================================ */
const genreNav = document.getElementById("genreNav");
const videoGrid = document.getElementById("videoGrid");
const genreTitle = document.getElementById("genreTitle");
const hint = document.getElementById("hint");

/* ---- Load the YouTube IFrame Player API (needed for volume fades) ---- */
// Resolves once the API has finished loading. The API calls the global
// onYouTubeIframeAPIReady function exactly once when it is ready.
const apiReady = new Promise((resolve) => {
  window.onYouTubeIframeAPIReady = resolve;
});
(function loadYouTubeApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

// Players currently on screen, so we can tear them down on genre switch.
let activeClips = []; // each: { player, intervalId }
// Bumped on every genre switch so async player creation can be cancelled.
let renderToken = 0;

// When any genre button is clicked, show that genre's songs.
genreNav.addEventListener("click", (event) => {
  const button = event.target.closest(".genre-btn");
  if (!button) return;

  const genreKey = button.dataset.genre;
  selectGenre(genreKey, button);
});

function selectGenre(genreKey, button) {
  const genre = GENRES[genreKey];
  if (!genre) return;

  // Highlight the active button, un-highlight the rest.
  document
    .querySelectorAll(".genre-btn")
    .forEach((b) => b.classList.toggle("active", b === button));

  hint.hidden = true;
  genreTitle.hidden = false;
  genreTitle.textContent = genre.label;

  // Let CSS tint the cards to match this genre's button color.
  videoGrid.dataset.genre = genreKey;

  renderVideos(genre.songs);
}

function renderVideos(songs) {
  renderToken++;
  const myToken = renderToken;

  destroyActiveClips(); // stop fades + remove old players
  videoGrid.innerHTML = ""; // clear previous genre's videos

  songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = "video-card";

    const heading = document.createElement("h3");
    heading.textContent = song.title || "Loading title…";
    card.appendChild(heading);

    // No manual title given? Look up the real one from YouTube.
    if (!song.title && song.youtubeId && song.youtubeId !== "PLACEHOLDER") {
      fetchYouTubeTitle(song.youtubeId, heading);
    }

    if (song.youtubeId && song.youtubeId !== "PLACEHOLDER") {
      const frame = document.createElement("div");
      frame.className = "video-frame";

      // The API replaces this empty div with the actual player iframe.
      const target = document.createElement("div");
      target.id = `player-${myToken}-${index}`;
      frame.appendChild(target);
      card.appendChild(frame);

      apiReady.then(() => {
        if (myToken !== renderToken) return; // genre changed; don't build it
        createPlayer(target.id, song);
      });
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "video-placeholder";
      placeholder.textContent = "🎬 Add a YouTube ID in js/app.js";
      card.appendChild(placeholder);
    }

    videoGrid.appendChild(card);
  });
}

// Stop every active fade loop and remove every player.
function destroyActiveClips() {
  activeClips.forEach(({ player, intervalId }) => {
    if (intervalId) clearInterval(intervalId);
    try {
      player.destroy();
    } catch (e) {
      /* player may not be fully built yet — ignore */
    }
  });
  activeClips = [];
}

function createPlayer(targetId, song) {
  const playerVars = { rel: 0, modestbranding: 1, playsinline: 1 };
  if (song.start != null) playerVars.start = song.start;
  if (song.end != null) playerVars.end = song.end;

  const player = new YT.Player(targetId, {
    width: "100%",
    height: "100%",
    videoId: song.youtubeId,
    playerVars,
    events: {
      // Start silent (but not muted) so the fade-in is clean.
      onReady: (event) => {
        event.target.unMute();
        event.target.setVolume(0);
      },
      onStateChange: (event) => onStateChange(event, song),
    },
  });

  activeClips.push({ player, intervalId: null });
}

function onStateChange(event, song) {
  const player = event.target;
  const clip = activeClips.find((c) => c.player === player);
  if (!clip) return;

  if (event.data === YT.PlayerState.PLAYING) {
    if (clip.intervalId) clearInterval(clip.intervalId);
    clip.intervalId = startFadeLoop(player, song);
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    if (clip.intervalId) {
      clearInterval(clip.intervalId);
      clip.intervalId = null;
    }
  }
}

// Continuously sets the volume while playing: ramps up over the first
// `fadeIn` seconds and back down over the last `fadeOut` seconds.
function startFadeLoop(player, song) {
  const fadeInDur = song.fadeIn != null ? song.fadeIn : DEFAULT_FADE;
  const fadeOutDur = song.fadeOut != null ? song.fadeOut : DEFAULT_FADE;
  const startTime = song.start != null ? song.start : 0;
  const endTime = song.end != null ? song.end : player.getDuration();

  return setInterval(() => {
    if (player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const t = player.getCurrentTime();
    let volume = 100;

    if (fadeInDur > 0) {
      const sinceStart = t - startTime;
      if (sinceStart < fadeInDur) {
        volume = Math.min(volume, (sinceStart / fadeInDur) * 100);
      }
    }
    if (fadeOutDur > 0 && endTime) {
      const untilEnd = endTime - t;
      if (untilEnd < fadeOutDur) {
        volume = Math.min(volume, (untilEnd / fadeOutDur) * 100);
      }
    }

    player.setVolume(Math.max(0, Math.min(100, volume)));
  }, 80);
}

// Look up a video's real title from YouTube (used when no "title" is set).
function fetchYouTubeTitle(youtubeId, heading) {
  const url = `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${youtubeId}`;
  fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data) => {
      heading.textContent = data.title;
    })
    .catch(() => {
      heading.textContent = "(title unavailable)";
    });
}
