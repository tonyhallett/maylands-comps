import { ReactNode } from "react";
import {
  LivestreamPlayerInfo,
  LivestreamService,
} from "../../../../../firebase/rtb/team";
import { PermittedLivestreamInputResult } from "./LiveStreamingDialog";

export type Seek = (moment: Moment) => void;
export type GetSeekableMoments<T extends Moment> = (moments: T[]) => T[];
export interface SeekFunctions<T extends Moment> {
  seek: Seek;
  getSeekableMoments: GetSeekableMoments<T>;
}
export type SeekCallback<T extends Moment> = (
  seekFunctions: SeekFunctions<T>,
) => void;

export interface Moment {
  date: Date;
}

export interface LivestreamProvider {
  service: LivestreamService;
  serviceName: string;
  icon: ReactNode;
  isPermitted: (url: string) => PermittedLivestreamInputResult | undefined;
  inputLabel: string;
  validInputs?: string[];
  canSeek: boolean;
  getPlayer<T extends Moment>(
    livestreamPlayerInfo: LivestreamPlayerInfo,
    seekCallback: SeekCallback<T>,
  ): ReactNode;
}
