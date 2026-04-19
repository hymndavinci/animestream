"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import {
  DefaultAudioLayout,
  DefaultVideoLayout,
  defaultLayoutIcons
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { ChevronDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StreamingLink } from "@/lib/types";
import { saveContinueWatching } from "@/lib/watch-history";

export function VideoPlayer({
  title,
  poster,
  links,
  animeId,
  episodeId,
  episodeNumber,
  providerLabel,
  embedUrl,
}: {
  title: string;
  poster: string;
  links: StreamingLink[];
  animeId?: string;
  episodeId: string;
  episodeNumber?: number;
  providerLabel: string;
  embedUrl?: string;
}) {
  const [selectedUrl, setSelectedUrl] = useState(links[0]?.url ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if all links are embed (iframe) mode
  const allEmbeds = links.length > 0 && links.every((l) => l.isEmbed);
  const hasEmbeds = links.some((l) => l.isEmbed);

  // Active embed source
  const [selectedEmbed, setSelectedEmbed] = useState(links[0]?.url ?? embedUrl ?? "");

  useEffect(() => {
    setSelectedUrl(links[0]?.url ?? "");
    setSelectedEmbed(links[0]?.url ?? embedUrl ?? "");
    setErrorMessage("");
  }, [links, embedUrl]);

  useEffect(() => {
    saveContinueWatching({
      animeId,
      episodeId,
      title,
      image: poster,
      episodeNumber,
      providerLabel,
      updatedAt: Date.now(),
    });
  }, [animeId, episodeId, episodeNumber, poster, providerLabel, title]);

  const selectedLink = useMemo(
    () => links.find((entry) => entry.url === selectedUrl) ?? links[0],
    [links, selectedUrl]
  );

  const handleVideoError = (detail: any) => {
    console.error("Video error:", detail);
    setErrorMessage(`Failed to load video: ${detail?.message || "Unknown error"}`);
    setLoading(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setErrorMessage("");
  };

  const handleVideoLoadStart = () => {
    setLoading(true);
    setErrorMessage("");
  };

  const handleVideoLoadedMetadata = () => {
    setLoading(false);
  };

  const handleVideoEnded = () => {
    const currentIndex = links.findIndex((link) => link.url === selectedUrl);
    if (currentIndex < links.length - 1) {
      setSelectedUrl(links[currentIndex + 1]?.url ?? selectedUrl);
    }
  };

  // ── No sources available ──────────────────────────────────────────────────
  if (!links.length && !embedUrl) {
    return (
      <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
        No playable streams were returned by the current provider. Try another title or wait for a provider to recover.
      </div>
    );
  }

  // ── IFRAME EMBED MODE ─────────────────────────────────────────────────────
  if (allEmbeds || (!links.filter((l) => !l.isEmbed).length && (embedUrl || hasEmbeds))) {
    const activeEmbed = selectedEmbed || embedUrl || "";
    const embedSources = links.filter((l) => l.isEmbed);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Now Playing</p>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          {embedSources.length > 1 && (
            <div className="relative">
              <select
                value={selectedEmbed}
                onChange={(e) => setSelectedEmbed(e.target.value)}
                className="appearance-none rounded-full border border-white/10 bg-white/5 px-4 py-2 pr-10 text-sm text-zinc-100 outline-none"
              >
                {embedSources.map((link) => (
                  <option key={link.url} value={link.url}>
                    {link.quality}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          )}
        </div>

        {/* iframe player */}
        <div className="aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
          <iframe
            key={activeEmbed}
            src={activeEmbed}
            title={title}
            width="100%"
            height="100%"
            style={{ border: "none", display: "block" }}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Source switcher buttons */}
        {embedSources.length > 1 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-zinc-500 mr-1">Server:</span>
            {embedSources.map((link) => (
              <Button
                key={link.url}
                variant={link.url === selectedEmbed ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedEmbed(link.url)}
              >
                {link.quality}
              </Button>
            ))}
            <a
              href={activeEmbed}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open in new tab
            </a>
          </div>
        )}
      </div>
    );
  }

  // ── NATIVE PLAYER (m3u8 / mp4) ────────────────────────────────────────────
  if (errorMessage) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          </div>
          <span className="font-medium">Playback Error</span>
        </div>
        <p>{errorMessage}</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setErrorMessage(""); setLoading(true); }}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const currentIndex = links.findIndex((link) => link.url === selectedUrl);
              if (currentIndex < links.length - 1) {
                setSelectedUrl(links[currentIndex + 1]?.url ?? selectedUrl);
                setErrorMessage("");
              }
            }}
          >
            Next Quality
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Now Playing</p>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="relative">
          <select
            value={selectedLink?.url}
            onChange={(event) => setSelectedUrl(event.target.value)}
            className="appearance-none rounded-full border border-white/10 bg-white/5 px-4 py-2 pr-10 text-sm text-zinc-100 outline-none"
          >
            {links.map((link) => (
              <option key={link.url} value={link.url}>
                {link.quality} {link.isM3U8 ? "HLS" : "MP4"}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-black/50 rounded-[2rem] border border-white/10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="mt-2 text-sm text-zinc-400">Loading video...</p>
          </div>
        </div>
      ) : (
        <MediaPlayer
          className="aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-glow"
          title={title}
          src={selectedLink?.url}
          crossOrigin
          playsInline
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onLoadStart={handleVideoLoadStart}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onEnded={handleVideoEnded}
        >
          <MediaProvider>
            <Poster className="vds-poster" src={poster} alt={title} />
          </MediaProvider>
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}

      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Button
            key={link.url}
            variant={link.url === selectedLink?.url ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedUrl(link.url)}
          >
            {link.quality}
          </Button>
        ))}
      </div>
    </div>
  );
}