import { useLocalStorage } from "./use-local-storage";
import {
  MusicPlayerState,
  MusicTrack,
  DEFAULT_MUSIC_PLAYER_STATE,
  extractYouTubeId,
  extractSpotifyId,
  detectProvider,
  isYouTubePlaylist
} from "@/types/music.types";

// Fetch YouTube video metadata using oEmbed API
async function fetchYouTubeMetadata(videoId: string): Promise<{ title: string; author: string } | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title || "Unknown Title",
      author: data.author_name || "Unknown Artist"
    };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return null;
  }
}

export function useMusicPlayer() {
  const { value: state, setValue: setState } = useLocalStorage<MusicPlayerState>(
    "star-forge-music-player",
    DEFAULT_MUSIC_PLAYER_STATE
  );

  const addTrack = async (url: string): Promise<MusicTrack | null> => {
    const provider = detectProvider(url);
    
    if (provider === "unknown") {
      return null;
    }

    let embedUrl: string | undefined;
    let id: string;
    let title: string | undefined;
    let thumbnail: string | undefined;

    if (provider === "youtube") {
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) return null;
      
      id = youtubeId;
      
      if (isYouTubePlaylist(url)) {
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${youtubeId}&autoplay=1&enablejsapi=1`;
        title = "YouTube Playlist";
      } else {
        embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`;
        
        // Fetch metadata for single videos
        const metadata = await fetchYouTubeMetadata(youtubeId);
        if (metadata) {
          title = `${metadata.title} - ${metadata.author}`;
        }
        
        // Set thumbnail
        thumbnail = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      }
    } else if (provider === "spotify") {
      const spotifyData = extractSpotifyId(url);
      if (!spotifyData) return null;
      
      id = spotifyData.id;
      embedUrl = `https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator&theme=0`;
      title = `Spotify ${spotifyData.type}`;
    } else {
      return null;
    }

    const track: MusicTrack = {
      id,
      url,
      provider,
      embedUrl,
      title,
      thumbnail
    };

    setState((prev: MusicPlayerState) => {
      // Check if track already exists
      const exists = prev.playlist.some(t => t.id === id);
      if (exists) {
        // Just set as current track
        const index = prev.playlist.findIndex(t => t.id === id);
        return {
          ...prev,
          currentTrack: prev.playlist[index],
          currentIndex: index,
          isPlaying: true
        };
      }

      const newPlaylist = [...prev.playlist, track];
      return {
        ...prev,
        playlist: newPlaylist,
        currentTrack: track,
        currentIndex: newPlaylist.length - 1,
        isPlaying: true
      };
    });

    return track;
  };

  const removeTrack = (id: string) => {
    setState((prev: MusicPlayerState) => {
      const newPlaylist = prev.playlist.filter(t => t.id !== id);
      const wasCurrentTrack = prev.currentTrack?.id === id;
      
      return {
        ...prev,
        playlist: newPlaylist,
        currentTrack: wasCurrentTrack ? (newPlaylist[0] || null) : prev.currentTrack,
        currentIndex: wasCurrentTrack ? 0 : prev.currentIndex,
        isPlaying: wasCurrentTrack ? false : prev.isPlaying
      };
    });
  };

  const play = () => {
    setState((prev: MusicPlayerState) => ({
      ...prev,
      isPlaying: true
    }));
  };

  const pause = () => {
    setState((prev: MusicPlayerState) => ({
      ...prev,
      isPlaying: false
    }));
  };

  const togglePlay = () => {
    setState((prev: MusicPlayerState) => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const next = () => {
    setState((prev: MusicPlayerState) => {
      if (prev.playlist.length === 0) return prev;
      
      const nextIndex = (prev.currentIndex + 1) % prev.playlist.length;
      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: prev.playlist[nextIndex],
        isPlaying: true
      };
    });
  };

  const previous = () => {
    setState((prev: MusicPlayerState) => {
      if (prev.playlist.length === 0) return prev;
      
      const prevIndex = prev.currentIndex === 0 
        ? prev.playlist.length - 1 
        : prev.currentIndex - 1;
      return {
        ...prev,
        currentIndex: prevIndex,
        currentTrack: prev.playlist[prevIndex],
        isPlaying: true
      };
    });
  };

  const selectTrack = (index: number) => {
    setState((prev: MusicPlayerState) => {
      if (index < 0 || index >= prev.playlist.length) return prev;
      
      return {
        ...prev,
        currentIndex: index,
        currentTrack: prev.playlist[index],
        isPlaying: true
      };
    });
  };

  const setVolume = (volume: number) => {
    setState((prev: MusicPlayerState) => ({
      ...prev,
      volume: Math.max(0, Math.min(100, volume))
    }));
  };

  const clearPlaylist = () => {
    setState((prev: MusicPlayerState) => ({
      ...prev,
      playlist: [],
      currentTrack: null,
      currentIndex: 0,
      isPlaying: false
    }));
  };

  return {
    currentTrack: state.currentTrack,
    playlist: state.playlist,
    isPlaying: state.isPlaying,
    volume: state.volume,
    currentIndex: state.currentIndex,
    addTrack,
    removeTrack,
    play,
    pause,
    togglePlay,
    next,
    previous,
    selectTrack,
    setVolume,
    clearPlaylist
  };
}
