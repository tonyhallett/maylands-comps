import { Player } from ".";

export const isTeam1 = (player: Player): boolean => {
  return player === "Team1Player1" || player === "Team1Player2";
};

export const getSinglesOpponent = (player: Player): Player => {
  return player === "Team1Player1" ? "Team2Player1" : "Team1Player1";
};

export const getDoublesOpponents = (player: Player): Player[] => {
  return isTeam1(player)
    ? ["Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team1Player2"];
};

export function getPlayers(isDoubles: boolean): Player[] {
  return isDoubles
    ? ["Team1Player1", "Team1Player2", "Team2Player1", "Team2Player2"]
    : ["Team1Player1", "Team2Player1"];
}

export const getDoublesPartner = (player: string): Player => {
  switch (player) {
    case "Team1Player1":
      return "Team1Player2";
    case "Team1Player2":
      return "Team1Player1";
    case "Team2Player1":
      return "Team2Player2";
    case "Team2Player2":
      return "Team2Player1";
  }
};
