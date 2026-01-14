import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Trash2,
  ListMusic,
  Link,
  Youtube
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingContainer } from "./floating-container";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { WidgetPosition } from "@/types/widget.types";

interface MiniMusicPlayerProps {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  stackIndex?: number;
}

export function MiniMusicPlayer({
  isVisible,
  isPinned,
  position,
  onClose,
  onTogglePin,
  onPositionChange,
  stackIndex
}: MiniMusicPlayerProps) {
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentIndex,
    addTrack,
    removeTrack,
    togglePlay,
    next,
    previous,
    selectTrack
  } = useMusicPlayer();

  const [urlInput, setUrlInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleAddTrack = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const track = await addTrack(urlInput.trim());
      if (track) {
        setUrlInput("");
        setShowAddForm(false);
        setError(null);
      } else {
        setError("Invalid URL. Use YouTube or Spotify links.");
      }
    } catch (err) {
      setError("Error adding music. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTrack();
    }
    if (e.key === "Escape") {
      setShowAddForm(false);
      setUrlInput("");
      setError(null);
    }
  };

  // Auto-play/pause based on isPlaying state
  useEffect(() => {
    if (iframeRef.current && currentTrack) {
      // For YouTube, we can try to control via postMessage
      if (currentTrack.provider === "youtube") {
        const message = isPlaying 
          ? '{"event":"command","func":"playVideo","args":""}' 
          : '{"event":"command","func":"pauseVideo","args":""}';
        iframeRef.current.contentWindow?.postMessage(message, "*");
      }
    }
  }, [isPlaying, currentTrack]);

  if (!isVisible) return null;

  // Expanded version when pinned
  if (isPinned) {
    return (
      <FloatingContainer
        title="Music Player"
        isVisible={isVisible}
        isPinned={isPinned}
        position={position}
        onClose={onClose}
        onTogglePin={onTogglePin}
        onPositionChange={onPositionChange}
        expandedClassName="w-[420px] max-h-[calc(100vh-120px)]"
        stackIndex={stackIndex}
      >
        <div className="flex flex-col h-full">
          {/* Embedded Player */}
          {currentTrack?.embedUrl ? (
            <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden mx-auto">
              <iframe
                ref={iframeRef}
                src={currentTrack.embedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                title="Music Player"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-white/40 bg-background/30 border border-white/10 rounded-lg mx-4 mt-4">
              <Music className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No music selected</p>
              <p className="text-xs mt-1 opacity-70">
                Add a YouTube or Spotify link
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 py-3 border-b border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white/90 hover:bg-white/10"
              onClick={previous}
              disabled={playlist.length <= 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
              onClick={togglePlay}
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white/90 hover:bg-white/10"
              onClick={next}
              disabled={playlist.length <= 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Track Form */}
          <div className="px-4 py-3 border-b border-white/10">
            <div>
              <Input
                placeholder="Cole o link do YouTube ou Spotify e pressione Enter..."
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm bg-background/50 border-white/10 text-white placeholder:text-white/30"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            {isLoading && (
              <p className="text-xs text-white/40 mt-1">Loading...</p>
            )}
          </div>

          {/* Playlist */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {playlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-white/40">
                <ListMusic className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Empty playlist</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group",
                      index === currentIndex
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-white/5"
                    )}
                    onClick={() => selectTrack(index)}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded shrink-0">
                      {track.provider === "youtube" ? (
                        <Youtube className="h-4 w-4 text-red-500" />
                      ) : (
                        <Music className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm truncate",
                          index === currentIndex
                            ? "text-white/90"
                            : "text-white/70"
                        )}
                      >
                        {track.title ||
                          `${
                            track.provider === "youtube"
                              ? "YouTube Video"
                              : "Spotify Track"
                          }`}
                      </p>
                    </div>
                    {index === currentIndex && isPlaying && (
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse delay-150" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FloatingContainer>
    );
  }

  // Mini version when not pinned
  return (
    <FloatingContainer
      title="Music"
      isVisible={isVisible}
      isPinned={isPinned}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onPositionChange={onPositionChange}
      className="w-56"
      stackIndex={stackIndex}
    >
      <div className="p-3 space-y-3">
        {/* Current Track Display */}
        {currentTrack ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/30">
              {currentTrack.thumbnail ? (
                <img
                  src={currentTrack.thumbnail}
                  alt="Track thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center",
                    currentTrack.provider === "youtube"
                      ? "bg-red-500/20"
                      : "bg-green-500/20"
                  )}
                >
                  {currentTrack.provider === "youtube" ? (
                    <Youtube className="h-5 w-5 text-red-500" />
                  ) : (
                    <Music className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40">Playing</p>
              <p className="text-sm font-medium text-white/90 truncate">
                {currentTrack.title ||
                  `${
                    currentTrack.provider === "youtube"
                      ? "YouTube Video"
                      : "Spotify Track"
                  }`}
              </p>
            </div>
            {isPlaying && (
              <div className="flex gap-0.5">
                <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-1 h-2 bg-primary rounded-full animate-pulse delay-75" />
                <div className="w-1 h-2 bg-primary rounded-full animate-pulse delay-150" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <Music className="h-6 w-6 mx-auto mb-1 text-white/30" />
            <p className="text-xs text-white/40">No music</p>
          </div>
        )}

        {/* Mini Controls */}
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:text-white/90 hover:bg-white/10"
            onClick={previous}
            disabled={playlist.length <= 1}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              isPlaying
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            )}
            onClick={togglePlay}
            disabled={!currentTrack}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:text-white/90 hover:bg-white/10"
            onClick={next}
            disabled={playlist.length <= 1}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Quick Add */}
        {showAddForm ? (
          <div className="space-y-2">
            <Input
              placeholder="Link (pressione Enter)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              className="h-7 text-xs bg-background/50 border-white/10 text-white placeholder:text-white/30"
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {isLoading && <p className="text-xs text-white/40">Loading...</p>}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => setShowAddForm(true)}
          >
            <Link className="h-3 w-3 mr-1" />
            Add music
          </Button>
        )}

        {/* Track count */}
        {playlist.length > 0 && (
          <div className="text-center">
            <span className="text-xs text-white/40">
              {currentIndex + 1} / {playlist.length} tracks
            </span>
          </div>
        )}
      </div>

      {/* Hidden iframe for audio playback in mini mode */}
      {currentTrack?.embedUrl && (
        <iframe
          ref={iframeRef}
          src={currentTrack.embedUrl}
          className="hidden"
          allow="autoplay; encrypted-media"
          title="Music Player Background"
        />
      )}
    </FloatingContainer>
  );
}
