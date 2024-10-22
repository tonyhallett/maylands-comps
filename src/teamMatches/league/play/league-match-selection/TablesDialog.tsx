import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import {
  TablesAndMatchesNotCompleted,
  mainTable,
} from "./getTablesAndMatchesNotCompleted";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UndoIcon from "@mui/icons-material/Undo";
import { useEffect, useState } from "react";

export interface TablesDialogProps {
  onClose: () => void;
  tablesAndMatchesNotCompleted: TablesAndMatchesNotCompleted;
  changed: (gameTableChanges: GameTableChange[]) => void;
}

// add a help for why you would want to do this
// also need to change where mention how to change

// what to do about Main

// do I just show the games and a text field alongside it
// or do I show the tables and the games underneath with a check box and an add table button
// if the latter need an alert to say that the table has already been assigned
// combine both views ?
// drag drop ?

interface GameTable {
  original: string;
  current: string;
  previous: string | undefined;
  key: string;
  gameNumber: number;
}
interface TablesDialogState {
  gameTables: GameTable[];
  tables: string[];
  selectedTable: string;
  newTable: string;
}

function getInitialState(
  tablesAndGamesNotCompleted: TablesAndMatchesNotCompleted,
): TablesDialogState {
  const { tables, matches } = tablesAndGamesNotCompleted;
  const tablesDialogState: TablesDialogState = {
    gameTables: matches.map((match) => {
      const tableId = match.tableId === undefined ? mainTable : match.tableId;
      const gameTable: GameTable = {
        original: tableId,
        current: tableId,
        previous: undefined,
        key: match.key,
        gameNumber: match.number,
      };
      return gameTable;
    }),
    tables: [...tables],
    selectedTable: "",
    newTable: "",
  };
  if (tables.length > 0) {
    // could look at gametables......
    /* tablesDialogState.selectedTable = tables.filter(
      (table) => table !== mainTable,
    )[0]; */
  }
  return tablesDialogState;
}

interface GameTableChange {
  newTableId: string;
  key: string;
}

export function TablesDialog({
  onClose,
  tablesAndMatchesNotCompleted: tablesAndGamesNotCompleted,
  changed,
}: TablesDialogProps) {
  const [state, setState] = useState<TablesDialogState | undefined>(undefined);
  useEffect(() => {
    setState(getInitialState(tablesAndGamesNotCompleted));
  }, [tablesAndGamesNotCompleted]);

  if (state === undefined) {
    return null;
  }
  const gameTablesToShow = state.gameTables.filter((gameTable) => {
    if (state.selectedTable === "") {
      return false;
    }

    if (gameTable.previous === undefined) {
      return gameTable.current !== state.selectedTable;
    }
    return gameTable.current === state.selectedTable;
  });
  const changedTables = state.gameTables.filter(
    (gt) => gt.current !== gt.original,
  );
  const newTable = state.newTable.trim();
  const addNewTableDisabled =
    newTable === "" || state.tables.some((table) => table === newTable);
  return (
    <Dialog fullScreen open={true} onClose={onClose}>
      <DialogTitle>Tables</DialogTitle>
      <DialogContent dividers sx={{ flexGrow: 0 }}>
        <TextField
          value={state.newTable}
          onChange={(evt) => {
            const newTable = evt.target.value;
            setState((prevState) => {
              return {
                ...prevState!,
                newTable,
              };
            });
          }}
        />
        <Button
          disabled={addNewTableDisabled}
          onClick={() => {
            setState((prevState) => {
              return {
                gameTables: prevState!.gameTables,
                selectedTable: prevState!.newTable.trim(),
                tables: [...prevState!.tables, prevState!.newTable.trim()],
                newTable: "",
              };
            });
          }}
        >
          Add Table
        </Button>
      </DialogContent>
      <DialogContent dividers sx={{ flexGrow: 0 }}>
        <FormControl sx={{ m: 0 }}>
          <InputLabel id="selectTableLabel">
            Table to add matches to:
          </InputLabel>
          <Select
            sx={{ minWidth: 300 }}
            labelId="selectTableLabel"
            value={state.selectedTable}
            input={<OutlinedInput label="Table to add matches to:" />}
            onChange={(e) => {
              const selectedValue = e.target.value as string;
              setState((prevState) => {
                return {
                  ...prevState!,
                  gameTables: prevState!.gameTables.map((gt) => {
                    return {
                      ...gt,
                      previous: undefined,
                    };
                  }),
                  selectedTable: selectedValue,
                };
              });
            }}
          >
            {state.tables.map((table) => {
              console.log(table);
              return (
                <MenuItem key={table} value={table}>
                  {table}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogContent dividers>
        <List>
          {gameTablesToShow.map((gameTable) => {
            return (
              <ListItemButton
                key={gameTable.key}
                onClick={() => {
                  setState((prevState) => {
                    const updateGameTable =
                      gameTable.previous === undefined
                        ? (gt: GameTable) => {
                            return {
                              ...gt,
                              current: prevState!.selectedTable,
                              previous: gt.current,
                            } as GameTable;
                          }
                        : (gt: GameTable) => {
                            return {
                              ...gt,
                              current: gt.previous,
                              previous: undefined,
                            } as GameTable;
                          };

                    const newGameTables = prevState!.gameTables.map((gt) => {
                      if (gt.key === gameTable.key) {
                        return updateGameTable(gt);
                      }
                      return gt;
                    });

                    return {
                      ...prevState!,
                      gameTables: newGameTables,
                    };
                  });
                }}
              >
                <ListItemIcon>
                  {gameTable.previous === undefined ? (
                    <AddCircleIcon />
                  ) : (
                    <UndoIcon />
                  )}
                </ListItemIcon>
                <ListItemText>{gameTable.gameNumber + 1}</ListItemText>
                <ListItemText>
                  {gameTable.previous === undefined
                    ? `move from ${gameTable.current}`
                    : `move back to ${gameTable.previous}`}
                </ListItemText>
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            changed(
              changedTables.map((gt) => {
                const gameTableChange: GameTableChange = {
                  newTableId: gt.current,
                  key: gt.key,
                };
                return gameTableChange;
              }),
            );
          }}
          disabled={changedTables.length === 0}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
