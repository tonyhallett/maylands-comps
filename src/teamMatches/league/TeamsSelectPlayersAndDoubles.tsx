import {
  SelectablePlayer,
  SelectablePlayerAutoCompleteProps,
  TeamMatchPlayersSelect,
  TeamSelectProps,
} from "../teamMatchPlayerSelect";
import { FiftyFifty } from "../../layoutComponents/FiftyFifty";
import { TeamDoublesSelect, TeamDoublesSelectProps } from "./DoublesSelect";
import { Card } from "@mui/material";

export const getTeamSelectPlayersAndDoublesAriaLabel = (isHome: boolean) => {
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
    <section aria-label={getTeamSelectPlayersAndDoublesAriaLabel(isHome)}>
      <h3>{teamName}</h3>
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
    </section>
  );
}

export const teamsSelectionAriaLabel = "Teams Selection";
export function TeamsSelectPlayersAndDoubles<TPlayer extends SelectablePlayer>({
  home,
  away,
  autoCompleteProps = {},
}: TeamsSelectPlayersAndDoublesProps<TPlayer>) {
  return (
    <section aria-label={teamsSelectionAriaLabel}>
      <Card
        sx={{
          padding: 1,
        }}
      >
        <FiftyFifty
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
      </Card>
    </section>
  );
}
