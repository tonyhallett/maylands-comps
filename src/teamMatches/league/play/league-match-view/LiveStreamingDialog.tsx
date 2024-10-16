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
  Stack,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ReactNode, useRef, useState } from "react";
import HelpIcon from "@mui/icons-material/Help";
import { useClickPopover } from "./useClickPopover";

//  https://youtube.com/live/U_BtCIwvHqg?feature=share
export const youtubeRegex = /^https:\/\/youtube\.com\/live\/([a-zA-Z0-9_-]+)$/;

// https://www.instagram.com/hallett1694/live/17927797259956173?igsh=MXgyN29vY3N5YzV5dQ%3D%3D
export const instagramRegex =
  /^https:\/\/www\.instagram\.com\/([a-zA-Z0-9_]+)\/live\/([0-9]+)\?igsh=([a-zA-Z0-9%]+)$/;

// https://www.twitch.tv/thallett74?sr=a
// provided by chat gpt
// export const twitchRegex = /^https:\/\/www\.twitch\.tv\/([a-zA-Z0-9_]+)$/;
export const twitchRegex = /^https:\/\/www\.twitch\.tv\/.+$/;

// https://www.facebook.com/tony.hallett.777/videos/1554747258504979/

//export const facebookRegex =  /^https:\/\/www\.facebook\.com\/([a-zA-Z0-9\.]+)\/videos\/([0-9]+)\/$/;

// todo check the regexes above ! see liveStreamRegexes.test.ts

export interface KeyedLivestream {
  key: string;
  url: string;
  tag: string;
}
export interface TableKeyedLiveStreams {
  table: string;
  streams: KeyedLivestream[];
}

export interface GameKeyedLiveStreams {
  game: number;
  streams: KeyedLivestream[];
}

export interface LiveStreamAvailability {
  free: KeyedLivestream[];
  tables: TableKeyedLiveStreams[];
  games: GameKeyedLiveStreams[];
}

interface Addition {
  tag: string;
  url: string;
}
interface AdditionsDeletions {
  additions: Addition[];
  deletions: KeyedLivestream[];
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

interface PermittedLivestreamInputResult {
  providerIndex: number;
  suggestedTag: string;
}

interface PermittedLivestreams {
  icons: ReactNode[];
  isPermitted: (url: string) => PermittedLivestreamInputResult | undefined;
}

export type LiveStreamDialogProps = {
  onClose: () => void;
  liveStreamAvailability: LiveStreamAvailability;
  changed: (liveStreamChanges: LivestreamChanges) => void;
  permittedLivestreams: PermittedLivestreams;
  helpNode: ReactNode;
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

export function LiveStreamingDialog({
  onClose,
  liveStreamAvailability,
  changed,
  permittedLivestreams,
  helpNode,
}: LiveStreamDialogProps) {
  const { free, games, tables } = liveStreamAvailability;
  // check will this ref remain if immediately open again
  const liveStreamsAndChangesRef = useRef<LiveStreamsAndChanges[]>([
    getNoChanges(free, "Free"),

    ...tables.map((table) =>
      getNoChanges(table.streams, `Table ${table.table}`),
    ),
    ...games.map((game) => getNoChanges(game.streams, `Game ${game.game + 1}`)),
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

  return (
    <Dialog disableEscapeKeyDown open onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>Live stream urls</span>
          <Stack direction="row" sx={{ alignItems: "center" }}>
            {permittedLivestreams.icons}
            {helpButton}
          </Stack>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
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
        </Box>
      </DialogContent>
      <DialogContent dividers>
        <AddDelete
          enabled={state.selectedValue !== -1}
          keyedLivestreams={state.livestreams}
          deleted={(keyedLiveStream) => {
            const additionsDeletions =
              liveStreamsAndChanges[state.selectedValue].changes;
            if (keyedLiveStream.key === "!") {
              additionsDeletions.additions =
                additionsDeletions.additions.filter(
                  (a) => a.url !== keyedLiveStream.url,
                );
            } else {
              additionsDeletions.deletions.push(keyedLiveStream);
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

            const addedKeyedLiveStream: KeyedLivestream = {
              key: "!",
              ...addition,
            };
            selectedLivestreamAndChanges.livestreams = [
              ...selectedLivestreamAndChanges.livestreams,
              addedKeyedLiveStream,
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
  added: (addition: Addition) => void;
  deleted: (keyedLiveStream: KeyedLivestream) => void;
  enabled: boolean;
}

function AddDelete({
  keyedLivestreams,
  enabled,
  added,
  deleted,
}: AddDeleteProps) {
  const [newLivestream, setNewLivestream] = useState("");
  const [tag, setTag] = useState("");

  const existing = keyedLivestreams.map((keyedLivestream) => {
    return (
      <ListItemButton
        key={keyedLivestream.url}
        onClick={() => deleted(keyedLivestream)}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={keyedLivestream.tag} />
      </ListItemButton>
    );
  });
  return (
    <>
      <Box border={1} borderRadius={1} marginBottom={1}>
        <List
          component="div"
          sx={{ minHeight: 200 }}
          subheader={<Box padding={2}>Remove</Box>}
        >
          {existing}
        </List>
      </Box>
      <Divider />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        marginTop={1}
        marginBottom={1}
      >
        <TextField
          sx={{ marginRight: 1 }}
          disabled={!enabled}
          label="Livestream"
          value={newLivestream}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setNewLivestream(event.target.value);
          }}
        />
        <TextField
          sx={{ marginRight: 1 }}
          disabled={!enabled}
          label="Tag"
          value={tag}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setTag(event.target.value);
          }}
        />
        <IconButton
          disabled={
            newLivestream.trim().length === 0 || tag.trim().length === 0
          }
          onClick={() => {
            added({ tag, url: newLivestream });
            setNewLivestream("");
            setTag("");
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </>
  );
}
