import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Fragment, ReactNode, useRef, useState } from "react";
import HelpIcon from "@mui/icons-material/Help";
import { useClickPopover } from "../../league-match-view/useClickPopover";
import {
  Livestream,
  LivestreamService,
} from "../../../../../firebase/rtb/team";

export interface KeyedLivestream extends Livestream {
  key: string;
}
export interface TableKeyedLiveStreams {
  table: string;
  streams: KeyedLivestream[];
}

export interface GameKeyedLiveStreams {
  game: number;
  streams: KeyedLivestream[];
}

export interface LivestreamAvailability {
  free: KeyedLivestream[];
  tables: TableKeyedLiveStreams[];
  games: GameKeyedLiveStreams[];
}

interface AdditionsDeletions {
  additions: Livestream[];
  deletions: string[];
}

interface TableAdditionsDeletions extends AdditionsDeletions {
  table: string;
}

interface GameAdditionsDeletions extends AdditionsDeletions {
  game: number;
}

interface LivestreamChanges {
  free: AdditionsDeletions;
  tables: TableAdditionsDeletions[];
  games: GameAdditionsDeletions[];
}

export interface PermittedLivestreamInputResult {
  suggestedTag: string;
  playerUrl?: string;
}

export interface PermittedLivestreams {
  icons: ReactNode[];
  isPermitted: (url: string) => PermittedLivestreamInputResult | undefined;
  getIconIndex: (service: LivestreamService) => number;
}

export interface LivestreamProvider {
  service: LivestreamService;
  icon: ReactNode;
  isPermitted: (url: string) => PermittedLivestreamInputResult | undefined;
  inputLabel?: string;
  validInputs?: string[];
}
type LivestreamProviders = LivestreamProvider[];

export type LiveStreamDialogProps = {
  onClose: () => void;
  liveStreamAvailability: LivestreamAvailability;
  changed: (liveStreamChanges: LivestreamChanges) => void;
  livestreamProviders: LivestreamProviders;
  helpNode: ReactNode;
  getGameMenuTitle: (game: number) => string;
  getTableMenuTitle: (table: string) => string;
};

function hasChanges(additionsDeletions: AdditionsDeletions) {
  return (
    additionsDeletions.additions.length > 0 ||
    additionsDeletions.deletions.length > 0
  );
}
function anyChanges(additionsDeletions: AdditionsDeletions[]) {
  return additionsDeletions.some((ad) => hasChanges(ad));
}
interface LiveStreamsAndChanges {
  livestreams: KeyedLivestream[];
  changes: AdditionsDeletions;
  title: string;
}
function getNoChanges(
  livestreams: KeyedLivestream[],
  title: string,
): LiveStreamsAndChanges {
  return {
    livestreams,
    changes: {
      additions: [],
      deletions: [],
    },
    title,
  };
}
interface LiveStreamDialogState {
  livestreams: KeyedLivestream[];
  selectedValue: number;
}

const fakeKeyPrefix = "!";
export function LiveStreamingDialog({
  onClose,
  liveStreamAvailability,
  changed,
  livestreamProviders,
  helpNode,
  getGameMenuTitle,
  getTableMenuTitle,
}: LiveStreamDialogProps) {
  const fakeKeyCounter = useRef(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { free, games, tables } = liveStreamAvailability;
  const liveStreamsAndChangesRef = useRef<LiveStreamsAndChanges[]>([
    getNoChanges(free, "Free"),

    ...tables.map((table) =>
      getNoChanges(table.streams, getTableMenuTitle(table.table)),
    ),
    ...games.map((game) =>
      getNoChanges(game.streams, getGameMenuTitle(game.game)),
    ),
  ]);

  const [state, setState] = useState<LiveStreamDialogState>({
    livestreams: [],
    selectedValue: -1,
  });
  const helpButton = useClickPopover(
    <IconButton>
      <HelpIcon />
    </IconButton>,
    helpNode,
  );
  const liveStreamsAndChanges = liveStreamsAndChangesRef.current;
  const anyChanged = anyChanges(
    liveStreamsAndChanges.map((lsc) => lsc.changes),
  );

  const selectedLabelId = "Select livestream applicable to";

  const createKeyedLivestream = (addition: Livestream): KeyedLivestream => {
    const addedKeyedLiveStream: KeyedLivestream = {
      key: `$fakeKeyPrefix}${fakeKeyCounter.current++}`,
      ...addition,
    };
    return addedKeyedLiveStream;
  };

  return (
    <Dialog
      disableEscapeKeyDown
      open
      fullWidth
      fullScreen={fullScreen}
      onClose={onClose}
    >
      <DialogTitle>Live stream urls</DialogTitle>
      <DialogContent dividers sx={{ flexGrow: 0 }}>
        <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
          <FormControl sx={{ m: 0, flexGrow: 1, marginRight: 1 }}>
            <InputLabel id={selectedLabelId}>Livestream for :</InputLabel>
            <Select
              labelId={selectedLabelId}
              value={state.selectedValue === -1 ? "" : state.selectedValue}
              input={<OutlinedInput label="Livestream for :" />}
              onChange={(e) => {
                const selectedValue = e.target.value as number;
                setState({
                  selectedValue,
                  livestreams: liveStreamsAndChanges[selectedValue].livestreams,
                });
              }}
            >
              {liveStreamsAndChanges.flatMap(({ title }, i) => {
                let listSubheader: ReactNode | undefined = undefined;
                if (i === 1) {
                  listSubheader = (
                    <ListSubheader key="tablesHeader">Tables</ListSubheader>
                  );
                } else if (i === 1 + tables.length) {
                  listSubheader = (
                    <ListSubheader key="gamesHeader">Games</ListSubheader>
                  );
                }
                const components = listSubheader ? [listSubheader] : [];
                components.push(
                  <MenuItem key={title} value={i}>
                    {title}
                  </MenuItem>,
                );
                return components;
              })}
            </Select>
          </FormControl>
          {helpButton}
        </Box>
      </DialogContent>
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <AddDelete
          livestreamProviders={livestreamProviders}
          enabled={state.selectedValue !== -1}
          keyedLivestreams={state.livestreams}
          deleted={(keyedLiveStream) => {
            const additionsDeletions =
              liveStreamsAndChanges[state.selectedValue].changes;
            if (keyedLiveStream.key.startsWith(fakeKeyPrefix)) {
              additionsDeletions.additions =
                additionsDeletions.additions.filter(
                  (a) => a.url !== keyedLiveStream.url,
                );
            } else {
              additionsDeletions.deletions.push(keyedLiveStream.key);
            }
            const selectedLivestreamAndChanges =
              liveStreamsAndChanges[state.selectedValue];
            selectedLivestreamAndChanges.livestreams =
              selectedLivestreamAndChanges.livestreams.filter(
                (livestream) => livestream.key !== keyedLiveStream.key,
              );
            setState((prev) => {
              return {
                ...prev,
                livestreams: selectedLivestreamAndChanges.livestreams,
              };
            });
          }}
          added={(addition) => {
            const selectedLivestreamAndChanges =
              liveStreamsAndChanges[state.selectedValue];
            const additionsDeletions = selectedLivestreamAndChanges.changes;
            additionsDeletions.additions.push(addition);

            selectedLivestreamAndChanges.livestreams = [
              ...selectedLivestreamAndChanges.livestreams,
              createKeyedLivestream(addition),
            ];
            setState((prev) => {
              return {
                ...prev,
                livestreams: selectedLivestreamAndChanges.livestreams,
              };
            });
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!anyChanged}
          onClick={() => {
            const freeChanges = liveStreamsAndChanges[0].changes;

            const tablesChanges: TableAdditionsDeletions[] =
              liveStreamsAndChanges
                .slice(1, 1 + tables.length)
                .map((lsc, i) => ({ ...lsc.changes, table: tables[i].table }))
                .filter((tad) => hasChanges(tad));

            const gamesChanges: GameAdditionsDeletions[] = liveStreamsAndChanges
              .slice(1 + tables.length)
              .map((lsc, i) => ({ ...lsc.changes, game: games[i].game }))
              .filter((gad) => hasChanges(gad));
            const liveStreamChanges: LivestreamChanges = {
              free: freeChanges,
              tables: tablesChanges,
              games: gamesChanges,
            };

            changed(liveStreamChanges);
          }}
        >
          Commit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface AddDeleteProps {
  keyedLivestreams: KeyedLivestream[];
  added: (addition: Livestream) => void;
  deleted: (key: KeyedLivestream) => void;
  enabled: boolean;
  livestreamProviders: LivestreamProviders;
}

interface AddState {
  livestream: string;
  permitted: boolean;
  tag: string;
  playerUrl: string | undefined;
}

interface SuggestedTag {
  suggestedTag: string | undefined;
  manualTag: boolean;
}

export const deleteSectionAriaLabel = "Delete livestreams";
export const addSectionAriaLabel = "Add livestream";

function AddDelete({
  keyedLivestreams,
  enabled,
  added,
  deleted,
  livestreamProviders,
}: AddDeleteProps) {
  const suggestedTagRef = useRef<SuggestedTag>({
    manualTag: false,
    suggestedTag: undefined,
  });
  const [addState, setAddState] = useState<AddState>({
    livestream: "",
    permitted: true,
    tag: "",
    playerUrl: undefined,
  });
  const [selectedProvider, setSelectedProvider] = useState(
    livestreamProviders[0],
  );
  const helpButton = useClickPopover(
    <IconButton>
      <HelpIcon />
    </IconButton>,
    selectedProvider.validInputs
      ? selectedProvider.validInputs.map((vi) => <div key={vi}>{vi}</div>)
      : null,
  );
  const theme = useTheme();
  const existing = keyedLivestreams.map((keyedLivestream) => {
    return (
      <Fragment key={keyedLivestream.url}>
        <ListItemButton onClick={() => deleted(keyedLivestream)}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>

          <ListItemText
            sx={{ overflow: "clip", maxWidth: 370 }}
            primary={keyedLivestream.tag}
          />
          <ListItemIcon sx={{ minWidth: 24, marginRight: 1 }}>
            {
              livestreamProviders.find(
                (lsp) => lsp.service === keyedLivestream.service,
              )!.icon
            }
          </ListItemIcon>
        </ListItemButton>
        <Divider />
      </Fragment>
    );
  });

  const resetAddedState = (clearTag = false) => {
    setAddState((prevState) => {
      const newState: AddState = {
        livestream: "",
        permitted: true,
        tag: "",
        playerUrl: undefined,
      };
      if (!clearTag) {
        newState.tag = prevState.tag;
      }
      return newState;
    });
  };

  const handleSelectedLivestreamProvider = (
    event: React.MouseEvent<HTMLElement>,
    newLivestreamProvider: LivestreamProvider | null,
  ) => {
    if (newLivestreamProvider !== null) {
      setSelectedProvider(newLivestreamProvider);
      resetAddedState(!suggestedTagRef.current.manualTag);
    }
  };

  let addLivestreamLabel = "Livestream";
  if (enabled && selectedProvider.inputLabel) {
    addLivestreamLabel = selectedProvider.inputLabel;
  }

  return (
    <>
      <Box
        component="section"
        aria-label={deleteSectionAriaLabel}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">Delete</Typography>
        <Box
          sx={{
            flexGrow: 1,
            border: 1,
            borderRadius: 1,
            borderColor: theme.palette.divider,
          }}
          marginTop={1}
        >
          <List
            sx={{
              minHeight: 96,
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            {existing}
          </List>
        </Box>
      </Box>

      <Box component="section" aria-label={addSectionAriaLabel}>
        <Typography sx={{ marginTop: 1, marginBottom: 1 }} variant="h6">
          Add
        </Typography>
        <ToggleButtonGroup
          value={selectedProvider}
          exclusive
          onChange={handleSelectedLivestreamProvider}
          size="small"
          sx={{ marginBottom: 1 }}
        >
          {livestreamProviders.map((lsp) => {
            return (
              <ToggleButton value={lsp} key={lsp.service}>
                {lsp.icon}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        <Box marginTop={1} marginBottom={1}>
          <Box sx={{ marginRight: 1, flexGrow: 1, marginBottom: 1 }}>
            <Box sx={{ marginBottom: 2, marginTop: 1 }}>
              <TextField
                fullWidth
                error={!addState.permitted}
                disabled={!enabled}
                label={addLivestreamLabel}
                value={addState.livestream}
                InputProps={{
                  endAdornment:
                    !addState.permitted && selectedProvider.validInputs
                      ? helpButton
                      : undefined,
                }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const text = event.target.value;
                  if (text === "") {
                    resetAddedState(!suggestedTagRef.current.manualTag);
                    return;
                  }
                  const permissionResult = selectedProvider.isPermitted(text);

                  setAddState((prevState) => {
                    const newState: AddState = {
                      ...prevState,
                      livestream: text,
                      permitted: permissionResult !== undefined,
                    };
                    if (permissionResult) {
                      if (!suggestedTagRef.current.manualTag) {
                        suggestedTagRef.current.suggestedTag =
                          permissionResult.suggestedTag;
                        newState.tag = permissionResult.suggestedTag;
                      }

                      newState.playerUrl = permissionResult.playerUrl;
                    }
                    return newState;
                  });
                }}
              />
            </Box>
            <TextField
              fullWidth
              disabled={!enabled}
              label="Tag"
              value={addState.tag}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const tag = event.target.value;
                if (tag !== suggestedTagRef.current.suggestedTag) {
                  suggestedTagRef.current.manualTag = true;
                }
                if (tag.length === 0) {
                  suggestedTagRef.current.manualTag = false;
                }
                setAddState((prevState) => {
                  return {
                    ...prevState,
                    tag,
                  };
                });
              }}
            />
          </Box>

          <IconButton
            disabled={
              !addState.permitted ||
              addState.livestream.trim().length === 0 ||
              addState.tag.trim().length === 0
            }
            onClick={() => {
              const newLivestream: Livestream = {
                tag: addState.tag,
                url: addState.livestream,
                service: selectedProvider.service,
              };
              if (addState.playerUrl) {
                newLivestream.playerUrl = addState.playerUrl;
              }
              added(newLivestream);
              resetAddedState(true);
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
    </>
  );
}
