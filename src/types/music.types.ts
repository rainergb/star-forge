export type MusicProvider = "youtube" | "spotify" | "unknown";

export interface MusicTrack {
  id: string;
  url: string;
  provider: MusicProvider;
  title?: string;
  embedUrl?: string;
  thumbnail?: string;
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  playlist: MusicTrack[];
  isPlaying: boolean;
  volume: number;
  currentIndex: number;
}

export const DEFAULT_MUSIC_PLAYER_STATE: MusicPlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  volume: 50,
  currentIndex: 0
};

// Helper to extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper to check if URL is a YouTube playlist
export function isYouTubePlaylist(url: string): boolean {
  return url.includes("playlist?list=") || url.includes("&list=");
}

// Helper to extract Spotify ID from URL
export function extractSpotifyId(url: string): { type: "track" | "playlist" | "album"; id: string } | null {
  const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (match) {
    return { type: match[1] as "track" | "playlist" | "album", id: match[2] };
  }
  return null;
}

// Detect provider from URL
export function detectProvider(url: string): MusicProvider {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("spotify.com")) {
    return "spotify";
  }
  return "unknown";
}
