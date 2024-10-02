import { UmpireView, UmpireViewProps } from "../../../../umpireView";
import { updateMatchFromUmpire } from "./updateMatchFromUmpire";
import { useRTB } from "../../../../firebase/rtb/rtbProvider";
import { Umpire } from "../../../../umpire";
import { DbMatch } from "../../../../firebase/rtb/match/dbMatch";

export type UmpireViewPropsNoUmpire = Omit<UmpireViewProps, "umpire">;
export type DbUmpireViewProps = UmpireViewPropsNoUmpire & {
  umpire: Umpire;
  dbMatch: DbMatch;
  matchKey: string;
};

export function DbUmpireView({
  umpire,
  dbMatch,
  matchKey: key,
  ...rest
}: DbUmpireViewProps) {
  const db = useRTB();
  const matchStateChanged = () => {
    // todo error handling
    updateMatchFromUmpire(dbMatch, key, umpire, db);
  };
  return (
    <UmpireView
      {...rest}
      umpire={{
        // todo - add a scoreboardWithUmpire method changed on the umpire and an optional button/radio to change it
        pointScored(isTeam1) {
          umpire.pointScored(isTeam1);
          matchStateChanged();
        },
        resetServerReceiver() {
          umpire.resetServerReceiver();
          matchStateChanged();
        },
        setFirstGameDoublesReceiver(player) {
          umpire.setFirstGameDoublesReceiver(player);
          matchStateChanged();
        },
        setServer(player) {
          umpire.setServer(player);
          matchStateChanged();
        },
        switchEnds() {
          umpire.switchEnds();
          matchStateChanged();
        },
        undoPoint() {
          umpire.undoPoint();
          matchStateChanged();
        },
      }}
    />
  );
}
