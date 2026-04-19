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

  // Auto-fallback states
  const [iframeLoading, setIframeLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Check if all links are embed (iframe) mode
  const allEmbeds = links.length > 0 && links.every((l) => l.isEmbed);
  const hasEmbeds = links.some((l) => l.isEmbed);
  const embedSources = useMemo(() => links.filter((l) => l.isEmbed), [links]);

  // Active embed source
  const [selectedEmbed, setSelectedEmbed] = useState(links[0]?.url ?? embedUrl ?? "");

  useEffect(() => {
    setSelectedUrl(links[0]?.url ?? "");
    setSelectedEmbed(links[0]?.url ?? embedUrl ?? "");
    setErrorMessage("");
    setFallbackIndex(0);
    setAllFailed(false);
    setManualMode(false);
    setIframeLoading(true);
  }, [links, embedUrl]);

  // Auto-fallback timer logic
  useEffect(() => {
    if (!hasEmbeds && !embedUrl) return;
    if (manualMode || allFailed || !iframeLoading) return;

    // Use embedSources or just the single embedUrl
    const sources = embedSources.length > 0 ? embedSources : (embedUrl ? [{ url: embedUrl, quality: "Default" }] : []);
    
    if (fallbackIndex >= sources.length) {
      setAllFailed(true);
      return;
    }

    const currentSource = sources[fallbackIndex];
    if (currentSource && selectedEmbed !== currentSource.url) {
      setSelectedEmbed(currentSource.url);
      setIframeLoading(true);
    }

    const timer = setTimeout(() => {
      // 8 seconds passed and still loading, move to next
      setFallbackIndex((prev) => prev + 1);
      setIframeLoading(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [fallbackIndex, embedSources, hasEmbeds, embedUrl, manualMode, allFailed, iframeLoading, selectedEmbed]);

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
    const activeProvider = embedSources.find(s => s.url === activeEmbed)?.quality || "Default";

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Now Playing</p>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        </div>

        {/* iframe player */}
        <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl group">
          {allFailed && !manualMode ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20">
              <div className="w-12 h-12 mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-red-200 font-medium mb-2">Semua server gagal memuat video.</p>
              <Button onClick={() => setManualMode(true)} variant="outline">
                Coba Pilih Server Manual
              </Button>
            </div>
          ) : (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-600 border-t-amber-400 mb-4"></div>
                  <p className="text-zinc-300 font-medium">Mencari server tersedia...</p>
                  <p className="text-zinc-500 text-sm mt-1 animate-pulse">Mencoba server: {activeProvider}</p>
                </div>
              )}
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
                onLoad={() => setIframeLoading(false)}
              />
              
              {/* Active Server Indicator (Bottom Right) */}
              <div className="absolute bottom-4 right-4 z-20 pointer-events-none opacity-50 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-medium tracking-wider text-zinc-300 uppercase">Server: {activeProvider}</p>
              </div>

              {/* Hover Server Switcher */}
              <div className={`absolute top-4 right-4 z-30 transition-opacity duration-300 ${manualMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-2 shadow-xl">
                  <span className="text-xs font-semibold text-zinc-400 px-2 pt-1 uppercase tracking-wider">Pilih Server</span>
                  <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {embedSources.map((link) => (
                      <button
                        key={link.url}
                        onClick={() => {
                          setSelectedEmbed(link.url);
                          setManualMode(true);
                          setIframeLoading(true);
                        }}
                        className={`text-left px-3 py-2 text-xs rounded-xl transition-all ${
                          link.url === selectedEmbed 
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                            : "text-zinc-300 hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        {link.quality}
                      </button>
                    ))}
                  </div>
                  <a
                    href={activeEmbed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 mt-1 pt-2 border-t border-white/10 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Buka di Tab Baru
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
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