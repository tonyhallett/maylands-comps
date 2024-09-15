import { Autocomplete, AutocompleteProps, Box, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { fillArray, fillArrayWithIndices } from "../helpers/fillArray";

interface TeamsMatchPlayersSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> {
  homeTeam: TeamSelectProps<TPlayer>;
  awayTeam: TeamSelectProps<TPlayer>;
  numPlayers: number;
  newPlayers?: boolean;
  autoCompleteProps?: AutoCompleteProps<TPlayer>;
}
type TeamSelectProps<TPlayer extends SelectablePlayer = SelectablePlayer> =
  Omit<
    TeamMatchPlayersSelectProps<TPlayer>,
    "numPlayers" | "autoCompleteProps"
  >;
interface SelectablePlayer {
  name: string;
}
type AutoCompleteProps<TPlayer extends SelectablePlayer = SelectablePlayer> =
  Pick<
    AutocompleteProps<TPlayer, undefined, undefined, undefined>,
    "autoComplete" | "autoHighlight" | "clearOnEscape" | "groupBy"
  >;

interface TeamMatchPlayersSelectProps<
  TPlayer extends SelectablePlayer = SelectablePlayer,
> {
  availablePlayers: TPlayer[];
  selectedPlayers: TPlayer[];
  playerSelected: (availablePlayer: TPlayer | null, position: number) => void;
  newPlayerSelected?: (name: string, position: number) => void;
  numPlayers: number;
  enabled?: boolean[];
  autoCompleteProps?: AutoCompleteProps<TPlayer>;
  labels?: string[];
  teamName?: string;
}

export function TeamsMatchPlayersSelect<
  TPlayer extends SelectablePlayer = SelectablePlayer,
>({
  homeTeam,
  awayTeam,
  numPlayers,
  autoCompleteProps,
}: TeamsMatchPlayersSelectProps<TPlayer>) {
  return (
    <Box display="flex" justifyContent="space-between">
      <TeamMatchPlayersSelect<TPlayer>
        {...homeTeam}
        numPlayers={numPlayers}
        autoCompleteProps={autoCompleteProps}
      />
      <TeamMatchPlayersSelect<TPlayer>
        {...awayTeam}
        numPlayers={numPlayers}
        autoCompleteProps={autoCompleteProps}
      />
    </Box>
  );
}

export function TeamMatchPlayersSelect<
  TPlayer extends SelectablePlayer = SelectablePlayer,
>({
  availablePlayers,
  selectedPlayers,
  playerSelected,
  numPlayers,
  enabled,
  newPlayerSelected,
  autoCompleteProps = {},
  labels,
  teamName,
}: TeamMatchPlayersSelectProps<TPlayer>) {
  if (labels === undefined) {
    labels = fillArray(numPlayers, (index) => `Player ${index + 1}`);
  }
  if (enabled === undefined) {
    enabled = fillArray(numPlayers, () => true);
  }
  if (enabled.length !== numPlayers) {
    throw new Error("enabled length must match numPlayers");
  }
  const playerPositions = fillArrayWithIndices(numPlayers);
  return (
    <div style={{ flexGrow: 1 }}>
      {teamName && <h3>{teamName}</h3>}
      {playerPositions.map((position) => {
        let selectedPlayer = selectedPlayers[position];
        if (selectedPlayer === undefined) {
          selectedPlayer = null;
        }

        return (
          // this is generic  but includes FreeSolo as a type parameter
          <Autocomplete
            {...autoCompleteProps}
            clearOnBlur
            freeSolo={newPlayerSelected !== undefined}
            disabled={!enabled[position]}
            key={position}
            options={availablePlayers}
            getOptionLabel={(option: TPlayer | string) => {
              // is a string when freeSolo is true
              if (typeof option === "string") {
                return option;
              }
              return option.name;
            }}
            value={selectedPlayer}
            onChange={(
              event: React.SyntheticEvent,
              newValue: TPlayer | null,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              reason,
            ) => {
              if (typeof newValue === "string") {
                newPlayerSelected!(newValue, position);
              } else {
                playerSelected(newValue, position);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={labels![position]}
                variant="standard"
              />
            )}
          />
        );
      })}
    </div>
  );
}
interface AvailablePlayer extends SelectablePlayer {
  id: string;
  grouping?: string;
}
//#region demo players
const tonyHallett: AvailablePlayer = {
  id: "1",
  grouping: "A",
  name: "Tony Hallett",
};
const janeSmith: AvailablePlayer = {
  id: "2",
  grouping: "A",
  name: "Jane Smith",
};

const rudolphHucker: AvailablePlayer = {
  grouping: "B",
  id: "3",
  name: "Rudolph Hucker",
};
const duncanBrown: AvailablePlayer = {
  id: "4",
  name: "Duncan Brown",
};

const other1: AvailablePlayer = {
  id: "5",
  name: "Other 1",
};

const other2: AvailablePlayer = {
  id: "6",
  name: "Other 2",
};

const other3: AvailablePlayer = {
  id: "7",
  name: "Other 3",
};
//#endregion

interface DemoTeamsMatchPlayersSelectState {
  selectedHomeTeamPlayers: AvailablePlayer[];
  selectedAwayTeamPlayers: AvailablePlayer[];
  homeTeamAvailablePlayers: AvailablePlayer[];
  awayTeamAvailablePlayers: AvailablePlayer[];
}
export function DemoTeamsMatchPlayersSelect() {
  // need to ensure that cannot select player for both teams
  // which would mean filtering the available players - value needs to be referentially stable
  const allHomeTeamAvailablePlayersRef = useRef<AvailablePlayer[]>([
    tonyHallett,
    janeSmith,
    rudolphHucker,
    duncanBrown,
  ]);
  const allAwayTeamAvailablePlayersRef = useRef<AvailablePlayer[]>([
    other1,
    other2,
    other3,
    tonyHallett,
  ]);
  const [state, setState] = useState<DemoTeamsMatchPlayersSelectState>({
    awayTeamAvailablePlayers: allAwayTeamAvailablePlayersRef.current,
    homeTeamAvailablePlayers: allHomeTeamAvailablePlayersRef.current,
    selectedAwayTeamPlayers: [undefined, undefined, undefined],
    selectedHomeTeamPlayers: [undefined, undefined, undefined],
  });

  const getAvailablePlayers = (
    selectedPlayers: Pick<
      DemoTeamsMatchPlayersSelectState,
      "selectedHomeTeamPlayers" | "selectedAwayTeamPlayers"
    >,
  ): Pick<
    DemoTeamsMatchPlayersSelectState,
    "awayTeamAvailablePlayers" | "homeTeamAvailablePlayers"
  > => {
    const filterPlayers = (players: AvailablePlayer[]) => {
      const availablePlayers = players.filter(
        (player) =>
          !selectedPlayers.selectedHomeTeamPlayers.includes(player) &&
          !selectedPlayers.selectedAwayTeamPlayers.includes(player),
      );
      return availablePlayers;
    };
    return {
      awayTeamAvailablePlayers: filterPlayers(
        allAwayTeamAvailablePlayersRef.current,
      ),
      homeTeamAvailablePlayers: filterPlayers(
        allHomeTeamAvailablePlayersRef.current,
      ),
    };
  };
  const homePlayerSelected = (player: AvailablePlayer, position: number) => {
    setState((prev) => {
      const selectedHomeTeamPlayers = prev.selectedHomeTeamPlayers.map(
        (p, index) => {
          if (index === position) {
            return player;
          }
          return p;
        },
      );
      return {
        ...prev,
        ...getAvailablePlayers({
          selectedHomeTeamPlayers,
          selectedAwayTeamPlayers: prev.selectedAwayTeamPlayers,
        }),
        selectedHomeTeamPlayers,
      };
    });
  };
  const awayPlayerSelected = (player: AvailablePlayer, position: number) => {
    setState((prev) => {
      const selectedAwayTeamPlayers = prev.selectedAwayTeamPlayers.map(
        (p, index) => {
          if (index === position) {
            return player;
          }
          return p;
        },
      );
      return {
        ...prev,
        ...getAvailablePlayers({
          selectedHomeTeamPlayers: prev.selectedHomeTeamPlayers,
          selectedAwayTeamPlayers,
        }),
        selectedAwayTeamPlayers,
      };
    });
  };
  return (
    <TeamsMatchPlayersSelect<AvailablePlayer>
      autoCompleteProps={{
        autoComplete: true, // !!! does not appear to be working
        /*
            If true, the portion of the selected suggestion that the user hasn't typed, known as the completion string, 
            appears inline after the input cursor in the textbox. 
            The inline completion string is visually highlighted and has a selected state.
        */

        autoHighlight: true, //	If true, the first option is automatically highlighted.
        clearOnEscape: true,
        groupBy(availablePlayer) {
          return availablePlayer.grouping ?? "Other";
        },
      }}
      numPlayers={3}
      homeTeam={{
        availablePlayers: state.homeTeamAvailablePlayers,
        selectedPlayers: state.selectedHomeTeamPlayers,
        playerSelected: homePlayerSelected,
        newPlayerSelected(name, position) {
          // e.g create the new player
          const newPlayer: AvailablePlayer = {
            id: "new",
            name,
          };
          allHomeTeamAvailablePlayersRef.current.push(newPlayer);
          homePlayerSelected(newPlayer, position);
        },
      }}
      awayTeam={{
        availablePlayers: state.awayTeamAvailablePlayers,
        selectedPlayers: state.selectedAwayTeamPlayers,
        playerSelected: awayPlayerSelected,
        newPlayerSelected(name, position) {
          // e.g create the new player
          const newPlayer: AvailablePlayer = {
            id: "new",
            name,
          };
          allAwayTeamAvailablePlayersRef.current.push(newPlayer);
          awayPlayerSelected(newPlayer, position);
        },
      }}
    />
  );
}
