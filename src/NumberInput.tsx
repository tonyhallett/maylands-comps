import * as React from "react";
import {
  Unstable_NumberInput as BaseNumberInput,
  NumberInputProps,
  numberInputClasses,
} from "@mui/base/Unstable_NumberInput";
import { styled } from "@mui/system";
import ArrowUp from "@mui/icons-material/ArrowDropUp";
import ArrowDown from "@mui/icons-material/ArrowDropDown";
type IconType = typeof ArrowUp;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActualNumberIncrementButtonProps = any;

function NumberIncrementButton(props: ActualNumberIncrementButtonProps) {
  return <MobileFriendlyButton {...props} iconType={ArrowUp} />;
}

function NumberDecrementButton(props: ActualNumberIncrementButtonProps) {
  return <MobileFriendlyButton {...props} iconType={ArrowDown} />;
}

//https://github.com/mui/material-ui/issues/39275
function MobileFriendlyButton(
  props: ActualNumberIncrementButtonProps & { iconType: IconType },
) {
  const { iconType, ...other } = props;
  const ComponentType = iconType;
  return (
    <ComponentType
      color={props.disabled ? "disabled" : undefined}
      fontSize="small"
      {...other}
      onMouseDown={(evt) => evt.preventDefault()}
    />
  );
}

const NumberInput = React.forwardRef(function CustomNumberInput(
  props: NumberInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInputElement,
        incrementButton: NumberIncrementButton,
        decrementButton: NumberDecrementButton,
      }}
      slotProps={{
        ...props.slotProps,
        input: {
          ...props.slotProps?.input,
          inputMode: "numeric", // https://github.com/mui/base-ui/issues/40
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

export default NumberInput;

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};
const StyledInputRoot = styled("div")(
  ({ theme }) => `
  
  font-weight: 400;
  border-radius: ${theme.shape.borderRadius}px;
  color: ${theme.palette.text.primary};
  background: 'rgba(255, 255, 255, 0.09)';
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;

  &.${numberInputClasses.focused} {
    border-color: ${theme.palette.text.primary};
  }

  &:hover {
    border-color: ${theme.palette.text.primary};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled("input")(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

/* const StyledButton = styled("button")(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 0;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
  background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
  background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
); */
