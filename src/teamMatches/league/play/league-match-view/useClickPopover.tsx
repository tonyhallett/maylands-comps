import { Popover } from "@mui/material";
import { ReactElement, ReactNode, cloneElement, useState } from "react";

// type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
export function useClickPopover(
  clickable: ReactElement,
  popoverContents: ReactNode,
) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handledClickable = cloneElement(clickable, {
    "aria-describedby": id,
    onClick: handleClick,
  });
  return (
    <>
      {handledClickable}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {popoverContents}
      </Popover>
    </>
  );
}
