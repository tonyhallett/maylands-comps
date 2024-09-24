import {
  SelectablePlayer,
  SelectablePlayerAutoCompleteProps,
  TeamMatchPlayersSelect,
  TeamSelectProps,
} from "../teamMatchPlayerSelect";
import { FirtyFity } from "../../layoutComponents/FirtyFity";
import { TeamDoublesSelect, TeamDoublesSelectProps } from "./DoublesSelect";
import { Card } from "@mui/material";

const getTeamSelectPlayersAndDoublesAriaLabel = (isHome: boolean) => {
  return isHome ? "home team selection" : "away team selection";
};
interface TeamSelectPlayersAndDoublesProps<TPlayer extends SelectablePlayer> {
  singles: Omit<TeamSelectProps<TPlayer>, "teamName">;
  doubles: Omit<TeamDoublesSelectProps, "isHome" | "autoCompleteProps">;
  isHome: boolean;
  teamName: string;
  autoCompleteProps?: SelectablePlayerAutoCompleteProps;
}

export interface TeamsSelectPlayersAndDoublesProps<
  TPlayer extends SelectablePlayer,
> {
  home: Omit<TeamSelectPlayersAndDoublesProps<TPlayer>, "autoCompleteProps">;
  away: Omit<TeamSelectPlayersAndDoublesProps<TPlayer>, "autoCompleteProps">;
  autoCompleteProps?: SelectablePlayerAutoCompleteProps;
}

export function TeamSelectPlayersAndDoubles<TPlayer extends SelectablePlayer>({
  singles,
  doubles,
  autoCompleteProps = {},
  isHome,
  teamName,
}: TeamSelectPlayersAndDoublesProps<TPlayer>) {
  return (
    <section
      style={{
        marginLeft: isHome ? undefined : "2px",
        marginRight: isHome ? "2px" : undefined,
      }}
      aria-label={getTeamSelectPlayersAndDoublesAriaLabel(isHome)}
    >
      <Card sx={{ padding: "0 10px" }}>
        <h3
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {teamName}
        </h3>
        <TeamMatchPlayersSelect<TPlayer>
          {...singles}
          isHome={isHome}
          autoCompleteProps={autoCompleteProps}
        />
        <TeamDoublesSelect
          {...doubles}
          isHome={isHome}
          autoCompleteProps={autoCompleteProps}
        />
      </Card>
    </section>
  );
}

export function TeamsSelectPlayersAndDoubles<TPlayer extends SelectablePlayer>({
  home,
  away,
  autoCompleteProps = {},
}: TeamsSelectPlayersAndDoublesProps<TPlayer>) {
  return (
    <FirtyFity
      left={
        <TeamSelectPlayersAndDoubles<TPlayer>
          autoCompleteProps={autoCompleteProps}
          {...home}
          isHome={true}
        />
      }
      right={
        <TeamSelectPlayersAndDoubles<TPlayer>
          autoCompleteProps={autoCompleteProps}
          {...away}
          isHome={false}
        />
      }
    />
  );
}
