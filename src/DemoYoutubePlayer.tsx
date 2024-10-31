import { TextField } from "@mui/material";
import { useRef, useState } from "react";
import YoutubePlayer from "react-player/youtube";

interface DemoState {
  duration: number;
  currentTime: number;
  now: Date;
}
export function DemoYoutubePlayer() {
  const playerRef = useRef<YoutubePlayer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any | null>(null);
  const [state, setState] = useState<DemoState | undefined>(undefined);
  const [seekTo, setSeekTo] = useState<number>(0);
  const [url, setUrl] = useState("https://www.youtube.com/live/jfKfPfyJRdk");
  const [urlText, setUrlText] = useState(
    "https://www.youtube.com/live/jfKfPfyJRdk",
  );
  return (
    <>
      <YoutubePlayer
        ref={(r) => {
          playerRef.current = r;
          ytPlayerRef.current = r?.getInternalPlayer();
        }}
        url={url}
        controls
        onBuffer={() => console.log("onBuffer")}
        onBufferEnd={() => console.log("onBufferEnd")}
        onEnded={() => console.log("onEnded")}
        onError={(err) => console.log("onError", err)}
        onPause={() => console.log("onPause")}
        onPlay={() => {
          const duration = playerRef.current!.getDuration();
          const currentTime = playerRef.current!.getCurrentTime();
          setState({
            duration,
            currentTime,
            now: new Date(),
          });
        }}
      />
      <TextField
        label="url"
        type="string"
        value={urlText}
        onChange={(evt) => {
          setUrlText(evt.target.value);
        }}
      />
      <button
        onClick={() => {
          setUrl(urlText);
        }}
      >
        Change url
      </button>
      {state && (
        <>
          <div>{state.now.toDateString()}</div>
          <div>{`duration = ${state.duration}`}</div>
          <div>{`current time = ${state.currentTime}`}</div>
          <TextField
            label="Seek to"
            type="number"
            value={seekTo}
            onChange={(evt) => {
              setSeekTo(Number.parseInt(evt.target.value));
            }}
          />
          <button
            onClick={() => {
              ytPlayerRef.current.seekTo(seekTo, true);
            }}
          >
            Seek
          </button>
        </>
      )}
    </>
  );
}
