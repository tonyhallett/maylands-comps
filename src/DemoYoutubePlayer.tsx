import { useRef } from "react";
import YoutubePlayer from "react-player/youtube";

export function DemoYoutubePlayer() {
  const playerRef = useRef<YoutubePlayer | null>(null);
  return (
    <>
      <YoutubePlayer
        ref={(r) => (playerRef.current = r)}
        url="https://www.youtube.com/live/jfKfPfyJRdk"
        controls
      />
      <button
        onClick={() => {
          alert(playerRef.current?.getDuration());
        }}
      >
        Get Duration
      </button>
      <button
        onClick={() => {
          alert(playerRef.current?.getCurrentTime());
        }}
      >
        Get current time
      </button>
    </>
  );
}
