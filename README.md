# 🎌 AnimeStream (animewatch-hymn)

A modern anime streaming web app built with **Next.js 14**, powered by **Jikan API (MyAnimeList)** for metadata and **iframe embed players** for streaming.

## ✨ Features

- 🏠 **Home Page** — Ongoing anime of the current season
- 🔍 **Search** — Search anime by title (powered by Jikan API)
- 📄 **Anime Detail** — Synopsis, genres, score, episode list
- 🎬 **Watch Page** — Iframe embed player with multiple server options (2embed, Miruro)
- 📺 **Continue Watching** — Resume where you left off (localStorage)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Video Player | Vidstack + iframe embed |
| Anime Metadata | [Jikan API v4](https://api.jikan.moe/v4) |
| Streaming | 2embed.cc / miruro.tv (iframe) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/hymndavinci/animestream.git
cd animestream

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
animestream/
├── app/
│   ├── page.tsx              # Home page (ongoing anime)
│   ├── search/page.tsx       # Search results
│   ├── anime/[id]/page.tsx   # Anime detail + episode list
│   └── watch/[episodeId]/    # Watch page with embed player
├── components/
│   ├── video-player.tsx      # Iframe embed player + server switcher
│   ├── anime-card.tsx        # Anime card component
│   ├── episode-list.tsx      # Episode list
│   └── continue-watching.tsx # Continue watching section
├── lib/
│   ├── api.ts                # All API functions (Jikan)
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Utility functions
│   └── watch-history.ts      # localStorage watch history
```

## 🔌 API

This project uses **[Jikan API v4](https://api.jikan.moe/v4)** — an unofficial MyAnimeList REST API. No API key required.

| Function | Endpoint |
|----------|----------|
| Home feed | `GET /seasons/now` |
| Search | `GET /anime?q={query}` |
| Detail | `GET /anime/{id}/full` |
| Episodes | `GET /anime/{id}/episodes` |

## ⚠️ Disclaimer

This project is for educational purposes only. Streaming content is served via third-party embed players. The developer does not host or distribute any video content.

## 📝 License

MIT
