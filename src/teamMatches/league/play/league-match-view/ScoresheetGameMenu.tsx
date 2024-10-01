import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import {
  TeamsConcededOrForfeited,
  anyConcededOrForfeited,
  getTeamsConcededOrForfeited,
} from "../../../../firebase/rtb/match/helpers/getTeamsConcededOrForfeited";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonIcon from "@mui/icons-material/Person";
import SportsIcon from "@mui/icons-material/Sports";
import { isMatchWon } from "../../../../umpire/matchWinState";
import { UmpireMatchAndKey } from "../league-match-selection/renderScoresheet-type";
import { getAreAllPlayersSelected } from "../../../../firebase/rtb/match/helpers/getAllPlayersSelected";
const ConcedeIcon = PersonOffIcon;
const UndoConcedeIcon = PersonIcon;
const UmpireIcon = SportsIcon;

const getConcedeMenuItems = (
  teamsConcededOrDefaulted: TeamsConcededOrForfeited,
  key: string,
  matchWon: boolean,
  allPlayersSelected: boolean,
  closeMenu: () => void,
  updateConceded: (conceded: boolean, isHome: boolean, key: string) => void,
) => {
  const forfeited =
    teamsConcededOrDefaulted.team1.forfeited ||
    teamsConcededOrDefaulted.team2.forfeited;

  const concedeDisabled = matchWon || !allPlayersSelected || forfeited;

  const getConcedeText = (isHome: boolean, conceded: boolean) => {
    const homeOrAway = isHome ? "Home" : "Away";
    const prefix = conceded ? "Undo " : "";
    return `${prefix}${homeOrAway} Concede`;
  };
  const getConcedeMenuItem = (isHome: boolean) => {
    const conceded = isHome
      ? teamsConcededOrDefaulted.team1.conceded
      : teamsConcededOrDefaulted.team2.conceded;
    const concedeIcon = conceded ? <UndoConcedeIcon /> : <ConcedeIcon />;
    return (
      <MenuItem
        onClick={() => {
          closeMenu();
          updateConceded(!conceded, isHome, key);
        }}
        key={isHome ? "homeConcedeMenuItem" : "awayConcedeMenuItem"}
        disabled={concedeDisabled}
      >
        <ListItemIcon>{concedeIcon}</ListItemIcon>
        <ListItemText>{getConcedeText(isHome, conceded)}</ListItemText>
      </MenuItem>
    );
  };
  return [getConcedeMenuItem(true), getConcedeMenuItem(false)];
};

const getUmpireMenuItem = (
  allPlayersSelected: boolean,
  concededOrForfeited: boolean,
  closeMenu: () => void,
  umpireGame: () => void,
) => {
  /*
      todo - use this to remove umpiring of a game
      const isUmpiringGame = umpireMatchIndex === gameMenuState!.index;
    */
  return (
    <MenuItem
      key="umpireMenuItem"
      disabled={!allPlayersSelected || concededOrForfeited}
      onClick={() => {
        umpireGame();
        closeMenu();
      }}
    >
      <ListItemIcon>
        <UmpireIcon />
      </ListItemIcon>
      <ListItemText>Umpire</ListItemText>
    </MenuItem>
  );
};

export const getGameMenuItems = (
  umpireMatchAndKey: UmpireMatchAndKey,
  closeMenu: () => void,
  umpireGame: (key: string) => void,
  updateConceded: (conceded: boolean, isHome: boolean, key: string) => void,
) => {
  const allPlayersSelected = getAreAllPlayersSelected(umpireMatchAndKey.match);
  const matchWon = isMatchWon(umpireMatchAndKey.matchState.matchWinState);
  const teamsConcededOrDefaulted = getTeamsConcededOrForfeited(
    umpireMatchAndKey.match,
  );
  return [
    getUmpireMenuItem(
      allPlayersSelected,
      anyConcededOrForfeited(teamsConcededOrDefaulted),
      closeMenu,
      () => umpireGame(umpireMatchAndKey.key),
    ),
    ...getConcedeMenuItems(
      teamsConcededOrDefaulted,
      umpireMatchAndKey.key,
      matchWon,
      allPlayersSelected,
      closeMenu,
      updateConceded,
    ),
  ];
};
export interface ScoresheetGameMenuProps {
  closeMenu: () => void;
  anchorElement: HTMLElement | undefined;
  umpireMatchAndKey: UmpireMatchAndKey | undefined;
  umpireGame: (key: string) => void;
  updateConceded: (conceded: boolean, isHome: boolean, key: string) => void;
}
export function ScoresheetGameMenu({
  closeMenu,
  anchorElement,
  umpireMatchAndKey,
  umpireGame,
  updateConceded,
}: ScoresheetGameMenuProps) {
  const showGameMenu = anchorElement !== undefined;
  const menuItems = showGameMenu
    ? getGameMenuItems(
        umpireMatchAndKey!,
        closeMenu,
        umpireGame,
        updateConceded,
      )
    : [];
  return (
    <Menu
      disableScrollLock
      open={showGameMenu}
      onClose={closeMenu}
      anchorEl={anchorElement}
    >
      {menuItems}
    </Menu>
  );
}
