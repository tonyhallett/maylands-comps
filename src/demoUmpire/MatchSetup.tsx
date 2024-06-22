import { SetStateAction, useState } from "react";
import { HandicapOptions, shiftHandicap } from "../umpire/shiftHandicap";
import { MatchOptions } from "./UmpireManager";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Checkbox, FormControlLabel, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export interface HandicapOption {
  handicap: number;
  cannotIncrement: boolean;
}
export type CompetitionType = "handicap" | "hardbat" | "normal";
export interface BestOfOption {
  bestOf: number;
  canDecrement: boolean;
}

function getCompetitionDescriptionSuffix(
  isDoubles: boolean,
  upTo: number,
  clearBy2: boolean,
  bestOf: number,
  numServes: number,
) {
  const singlesOrDoubles = isDoubles ? "Doubles" : "Singles";
  const clearByDescription = clearBy2 ? "" : " ( not 2 difference )";
  return `${singlesOrDoubles}, Best of ${bestOf}, Up to ${upTo}${clearByDescription}, ${numServes} serves`;
}

export function MatchSetup({
  setMatchOptions,
}: {
  setMatchOptions: (matchOptions: MatchOptions) => void;
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
                      <AddIcon />
                    </IconButton>
                  </td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(false, handicap1, setHandicap1)
                      }
                    >
                      <RemoveIcon />
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
                      <AddIcon />
                    </IconButton>
                  </td>
                  <td>
                    <IconButton
                      onClick={() =>
                        changeHandicap(false, handicap2, setHandicap2)
                      }
                    >
                      <RemoveIcon />
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
          <AddIcon />
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
          <RemoveIcon />
        </IconButton>
      </label>
      <IconButton
        style={{ margin: "0 auto", display: "block", color: "white" }}
        onClick={() => {
          // todo - different sub type
          const newMatchOptions: MatchOptions = {
            bestOf: bestOfOption.bestOf,
            upTo: 11,
            team1StartGameScore: 0,
            team2StartGameScore: 0,
            numServes: 2,
            competitionDescription: "",
            isDoubles,
            team1Player1Name: "A Bonnici",
            team2Player1Name: "T Hallett",
            team1Player2Name: isDoubles ? "D Brown" : undefined,
            team2Player2Name: isDoubles ? "R Hucker" : undefined,
            clearBy2: false,
          };
          let prefix = "";
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
              prefix = "Handicap";

              break;
            case "hardbat":
              newMatchOptions.upTo = 15;
              newMatchOptions.numServes = 5;
              prefix = "Hardbat";
              break;
            case "normal":
              newMatchOptions.clearBy2 = true;
          }
          const suffix = getCompetitionDescriptionSuffix(
            isDoubles,
            newMatchOptions.upTo,
            newMatchOptions.clearBy2,
            newMatchOptions.bestOf,
            newMatchOptions.numServes,
          );
          newMatchOptions.competitionDescription =
            prefix === "" ? suffix : `${prefix} ${suffix}`;
          setMatchOptions(newMatchOptions);
        }}
      >
        <div style={{ fontSize: 24, fontFamily: "Noto Color Emoji variant0" }}>
          🏓
        </div>
      </IconButton>
    </div>
  );
}
