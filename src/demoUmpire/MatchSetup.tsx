import { SetStateAction, useState } from "react";
import { HandicapOptions, shiftHandicap } from "../umpire/shiftHandicap";
import { UmpireManagerOptions } from "./UmpireManager";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  useTheme,
} from "@mui/material";
import IncrementIcon from "@mui/icons-material/Add";
import DecrementIcon from "@mui/icons-material/Remove";
import { CarbonBatButton } from "../umpireView/iconButtons/CarbonBatButton";
import { getContrastingPaletteColor } from "../themeHelpers/getContrastingPaletteColor";

export interface HandicapOption {
  handicap: number;
  cannotIncrement: boolean;
}
export type CompetitionType = "handicap" | "hardbat" | "normal";
export interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

export function MatchSetup({
  setMatchOptions,
}: {
  setMatchOptions: (matchOptions: UmpireManagerOptions) => void;
}) {
  const [handicap1, setHandicap1] = useState<HandicapOption>({
    cannotIncrement: false,
    handicap: 0,
  });
  const [handicap2, setHandicap2] = useState<HandicapOption>({
    cannotIncrement: false,
    handicap: 0,
  });

  const [selectedComp, setSelectedComp] = useState<CompetitionType>("normal");
  const [shiftHandicapScore, setShiftHandicap] = useState(true);
  const [isDoubles, setIsDoubles] = useState(false);
  const [bestOfOption, setBestOfOption] = useState<BestOfOption>({
    bestOf: 3,
    canDecrement: true,
  });
  const theme = useTheme();
  const contrastingSuccessColor = getContrastingPaletteColor(
    theme.palette.success,
    theme.palette.mode === "dark",
  );

  const changeHandicap = (
    increment: boolean,
    handicapOption: HandicapOption,
    setHandicapOption: React.Dispatch<SetStateAction<HandicapOption>>,
  ) => {
    if (increment) {
      const newHandicap = handicapOption.handicap + 1;
      const cannotIncrement = newHandicap === 30;
      setHandicapOption({
        handicap: newHandicap,
        cannotIncrement,
      });
    } else {
      setHandicapOption({
        handicap: handicapOption.handicap - 1,
        cannotIncrement: false,
      });
    }
  };

  return (
    <div>
      <div>
        <FormControl>
          <InputLabel id="select-competition-label">Competition</InputLabel>
          <Select
            labelId="select-competition-label"
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value as CompetitionType)}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="hardbat">Hardbat</MenuItem>
            <MenuItem value="handicap">Handicap</MenuItem>
          </Select>
        </FormControl>
        {selectedComp === "handicap" ? (
          <>
            <FormControlLabel
              style={{ display: "block" }}
              control={
                <Checkbox
                  checked={shiftHandicapScore}
                  onChange={() => setShiftHandicap(!shiftHandicapScore)}
                />
              }
              label="Shift negatives"
            />

            <div>Handicaps</div>
            <table>
              <tbody>
                <tr>
                  <td>{handicap1.handicap}</td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(true, handicap1, setHandicap1)
                      }
                      disabled={handicap1.cannotIncrement}
                    >
                      <IncrementIcon />
                    </IconButton>
                  </td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(false, handicap1, setHandicap1)
                      }
                    >
                      <DecrementIcon />
                    </IconButton>
                  </td>
                </tr>
                <tr>
                  <td>{handicap2.handicap}</td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(true, handicap2, setHandicap2)
                      }
                      disabled={handicap2.cannotIncrement}
                    >
                      <IncrementIcon />
                    </IconButton>
                  </td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(false, handicap2, setHandicap2)
                      }
                    >
                      <DecrementIcon />
                    </IconButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
      </div>

      <FormControlLabel
        control={
          <Checkbox
            checked={isDoubles}
            onChange={() => setIsDoubles(!isDoubles)}
          />
        }
        label="Doubles"
      />

      <label style={{ display: "block", marginBottom: 10 }}>
        Best of {bestOfOption.bestOf}{" "}
        <IconButton
          onClick={() =>
            setBestOfOption({
              canDecrement: true,
              bestOf: bestOfOption.bestOf + 2,
            })
          }
        >
          <IncrementIcon />
        </IconButton>
        <IconButton
          disabled={!bestOfOption.canDecrement}
          onClick={() => {
            const newBestOf = bestOfOption.bestOf - 2;
            setBestOfOption({
              canDecrement: newBestOf !== 1,
              bestOf: newBestOf,
            });
          }}
        >
          <DecrementIcon />
        </IconButton>
      </label>
      <CarbonBatButton
        rubberFillColor={contrastingSuccessColor}
        enabled
        clicked={() => {
          // todo - different sub type
          const newMatchOptions: UmpireManagerOptions = {
            bestOf: bestOfOption.bestOf,
            upTo: 11,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            team1Player1Name: "A Bonnici",
            team2Player1Name: "T Hallett",
            team1Player2Name: isDoubles ? "D Brown" : undefined,
            team2Player2Name: isDoubles ? "R Hucker" : undefined,
            clearBy2: false,
          };
          switch (selectedComp) {
            case "handicap":
              // eslint-disable-next-line no-case-declarations
              let handicapOptions: HandicapOptions = {
                team1Handicap: handicap1.handicap,
                team2Handicap: handicap2.handicap,
                upTo: 31,
              };
              if (shiftHandicapScore) {
                handicapOptions = shiftHandicap(handicapOptions);
              }
              newMatchOptions.upTo = handicapOptions.upTo;
              newMatchOptions.team1StartGameScore =
                handicapOptions.team1Handicap;
              newMatchOptions.team2StartGameScore =
                handicapOptions.team2Handicap;
              newMatchOptions.numServes = 5;
              break;
            case "hardbat":
              newMatchOptions.upTo = 15;
              newMatchOptions.numServes = 5;
              break;
            case "normal":
              newMatchOptions.clearBy2 = true;
          }

          setMatchOptions(newMatchOptions);
        }}
      />
    </div>
  );
}
