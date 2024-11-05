import { PermittedLivestreamInputResult } from "../LiveStreamingDialog";
import {
  LivestreamProvider,
  Moment,
  SeekCallback,
  SeekFunctions,
} from "../LivestreamProvider";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { LivestreamService } from "../../../../../../firebase/rtb/team";
import YoutubePlayer from "react-player/youtube";
import { useRef } from "react";

// https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video
// https://youtube.com/live/U_BtCIwvHqg?feature=share
// https://www.youtube.com/live/jWK9PiYzTiQ?si=GcYnObJDva19ysVF
/* const youtubeRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)([a-zA-Z0-9_-]{11})$/; */

const youtubeLiveRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
// todo query parameters
const youtubeWatchRegex =
  /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$/;

const regexes = [youtubeLiveRegex, youtubeWatchRegex];

const getResult = (match: RegExpMatchArray): PermittedLivestreamInputResult => {
  return {
    suggestedTag: `${match[1]}`,
    playerProp: match[0],
  };
};
export const youtubeProvider: LivestreamProvider = {
  icon: <YouTubeIcon />,
  service: LivestreamService.youtube,
  serviceName: "YouTube",
  isPermitted: (url) => {
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) {
        return getResult(match);
      }
    }

    return undefined;
  },
  inputLabel: "Share url",
  canSeek: true,
  getPlayer(livestreamPlayerInfo, seekCallback) {
    return (
      <SeekableYoutubePlayer
        url={livestreamPlayerInfo.playerProp!}
        seekCallback={seekCallback}
      />
    );
  },
};

interface SeekableYoutubePlayerProps<T extends Moment> {
  url: string;
  seekCallback: SeekCallback<T>;
}

function getDiffInSeconds(laterDate: Date, moment: Moment) {
  return getDateDiffInSeconds(laterDate, moment.date);
}

function getDateDiffInSeconds(laterDate: Date, earlierDate: Date) {
  return (laterDate.getTime() - earlierDate.getTime()) / 1000;
}

export interface YouTubeInitialState {
  currentTime: number;
  date: Date;
}

export function youtubeGetSeekableMoments<T extends Moment>(
  moments: T[],
  initialState: YouTubeInitialState,
  now: Date,
): T[] {
  return moments.filter((moment) => {
    if (moment.date > now) {
      return false;
    }
    if (moment.date > initialState.date) {
      return true;
    }
    return (
      getDiffInSeconds(initialState.date, moment) < initialState.currentTime
    );
  });
}

function SeekableYoutubePlayer<T extends Moment>({
  url,
  seekCallback,
}: SeekableYoutubePlayerProps<T>) {
  const initialStateRef = useRef<YouTubeInitialState | undefined>(undefined);
  const playerRef = useRef<YoutubePlayer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any | null>(null);
  const seek = (moment: T) => {
    const initialState = initialStateRef.current!;
    const now = new Date();
    // cannot trust playerRef.current!.getDuration()
    const duration =
      initialState.currentTime + getDateDiffInSeconds(now, initialState.date);
    const diffInSeconds = getDiffInSeconds(now, moment);
    const time = duration - diffInSeconds;
    ytPlayerRef.current.seekTo(time, true);
  };

  const getSeekableMoments = (moments: T[]) => {
    return youtubeGetSeekableMoments(
      moments,
      initialStateRef.current!,
      new Date(),
    );
  };
  const seekFunctions: SeekFunctions<T> = {
    seek,
    getSeekableMoments,
  };
  return (
    <YoutubePlayer
      style={{ aspectRatio: "16/9" }}
      width="100%"
      height="auto"
      ref={(r) => {
        playerRef.current = r;
        ytPlayerRef.current = r?.getInternalPlayer();
      }}
      controls
      url={url}
      onPlay={() => {
        if (initialStateRef.current === undefined) {
          const currentTime = playerRef.current!.getCurrentTime();
          const now = new Date();
          seekCallback(seekFunctions);
          initialStateRef.current = {
            currentTime,
            date: now,
          };
        }
      }}
    />
  );
}
