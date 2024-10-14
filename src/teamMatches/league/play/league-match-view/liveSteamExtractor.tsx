import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";

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

interface KeyedLivestream {
  key: string;
  livestream: string;
}
interface DisplayKeyedLiveStreams {
  display: string;
  streams: KeyedLivestream[];
}

interface LiveStreamAvailability {
  allTables: KeyedLivestream[];
  tables: DisplayKeyedLiveStreams[];
  games: DisplayKeyedLiveStreams[];
}

interface AdditionsDeletions {
  additions: string[];
  deletions: KeyedLivestream[];
}

interface LivestreamChanges {
  allTables: AdditionsDeletions;
  tables: AdditionsDeletions[];
  games: AdditionsDeletions[];
}

export type LiveStreamDialogProps = {
  showLivestreamDialog: boolean;
  setShowLivestreamDialog: (show: boolean) => void;
  liveStreamAvailability: LiveStreamAvailability;
  changed: (liveStreamChanges: LivestreamChanges) => void;
};

interface KeyedLiveStreamsState {
  allTables: KeyedLivestream[];
  tables: KeyedLivestream[][];
  games: KeyedLivestream[][];
}

function hasChanges(additionsDeletions: AdditionsDeletions) {
  return (
    additionsDeletions.additions.length > 0 ||
    additionsDeletions.deletions.length > 0
  );
}
function anyChanges(additionsDeletions: AdditionsDeletions[]) {
  return additionsDeletions.some((ad) => hasChanges(ad));
}

export function LiveStreamingDialog({
  setShowLivestreamDialog,
  showLivestreamDialog,
  liveStreamAvailability,
  changed,
}: LiveStreamDialogProps) {
  const { allTables, games, tables } = liveStreamAvailability;
  // check will this ref remain if immediately open again
  const changesRef = useRef<LivestreamChanges>({
    allTables: { additions: [], deletions: [] },
    tables: tables.map(() => ({ additions: [], deletions: [] })),
    games: games.map(() => ({ additions: [], deletions: [] })),
  });
  const changes = changesRef.current;
  const anyChanged =
    hasChanges(changes.allTables) ||
    anyChanges(changes.games) ||
    anyChanges(changes.tables);

  const [keyedLiveStreamStates, setKeyedLiveStreamStates] =
    useState<KeyedLiveStreamsState>({
      allTables: [...allTables],
      tables: [...tables.map((t) => t.streams)],
      games: [...games.map((g) => g.streams)],
    });
  const [selectedValue, setSelectedValue] = useState("allTables");

  const { additionsDeletions, keyedLiveStreamsState } = useMemo(() => {
    const getStateOrChanges = (
      value: string,
      y: KeyedLiveStreamsState | LivestreamChanges,
    ) => {
      if (value === "allTables") {
        return y.allTables;
      } else {
        const isTables = value.startsWith("Table");
        const gamesOrTables = isTables ? y.tables : y.games;
        const index = Number(value[value.length - 1]);
        return gamesOrTables[index];
      }
    };

    const additionsDeletions = getStateOrChanges(
      selectedValue,
      changes,
    ) as unknown as AdditionsDeletions;

    const keyedLiveStreamsState = getStateOrChanges(
      selectedValue,
      keyedLiveStreamStates,
    ) as unknown as KeyedLivestream[];
    return {
      additionsDeletions,
      keyedLiveStreamsState,
    };
  }, [selectedValue, changes, keyedLiveStreamStates]);
  const selectedLabelId = "Select livestream applicable to";
  return (
    <Dialog
      disableEscapeKeyDown
      open={showLivestreamDialog}
      onClose={() => setShowLivestreamDialog(false)}
    >
      <DialogTitle> Live stream urls</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id={selectedLabelId}>Livestream for :</InputLabel>
            <Select
              labelId={selectedLabelId}
              value={selectedValue}
              input={<OutlinedInput label="Livestream for :" />}
              onChange={(e) => {
                setSelectedValue(e.target.value);
              }}
            >
              <MenuItem key="allTables" value="allTables">
                All tables
              </MenuItem>
              {tables.map((table, i) => (
                <MenuItem key={table.display} value={`Table${i}`}>
                  {`Table ${table.display}`}
                </MenuItem>
              ))}
              {games.map((game, i) => (
                <MenuItem key={game.display} value={`Game${i}`}>
                  {game.display}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogContent>
        <AddDelete
          keyedLivestreams={keyedLiveStreamsState}
          deleted={(keyedLiveStream) => {
            if (keyedLiveStream.key === "!") {
              additionsDeletions.additions =
                additionsDeletions.additions.filter(
                  (a) => a !== keyedLiveStream.livestream,
                );
            } else {
              additionsDeletions.deletions.push(keyedLiveStream);
            }
            // todo common code to below
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setKeyedLiveStreamStates((prevState) => {
              throw new Error("Not implemented");
            });
          }}
          added={(livestreamUrl) => {
            additionsDeletions.additions.push(livestreamUrl);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const addedKeyedLiveStream: KeyedLivestream = {
              key: "!",
              livestream: livestreamUrl,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setKeyedLiveStreamStates((prevState) => {
              throw new Error("Not implemented");
            });
            // need to
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!anyChanged}
          onClick={() => changed(changesRef.current)}
        >
          Commit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface AddDeleteProps {
  keyedLivestreams: KeyedLivestream[];
  added: (livestreamUrl: string) => void;
  deleted: (keyedLiveStream: KeyedLivestream) => void;
}
// going to want to be able to provide a short description on a live stream
// perhaps also icons and parts of the url
function AddDelete({ keyedLivestreams }: AddDeleteProps) {
  return keyedLivestreams.map((keyedLivestream) => {
    return <div key={keyedLivestream.key}>{keyedLivestream.livestream}</div>;
  });
}

export function DemoLiveStreamDialog() {
  return (
    <LiveStreamingDialog
      changed={() => {}}
      showLivestreamDialog={true}
      setShowLivestreamDialog={() => {}}
      liveStreamAvailability={{
        allTables: [
          {
            key: "789",
            livestream: "alltables",
          },
        ],
        games: [
          {
            display: "A V X",
            streams: [
              {
                key: "123",
                livestream: "A V X",
              },
            ],
          },
        ],
        tables: [
          {
            display: "Main",
            streams: [
              {
                key: "456",
                livestream: "Main",
              },
            ],
          },
        ],
      }}
    />
  );
}
