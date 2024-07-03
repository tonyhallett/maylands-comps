import Draggable from "react-draggable";
import { PropsWithChildren, useRef } from "react";
import { Box, Card } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export interface DraggableCardProps {
  cardStyle: React.CSSProperties;
}

export function DraggableCard({
  children,
  cardStyle,
}: PropsWithChildren<DraggableCardProps>) {
  const nodeRef = useRef(null);
  return (
    <Draggable handle={".handle"} nodeRef={nodeRef}>
      <Card style={{ display: "inline-block", ...cardStyle }} ref={nodeRef}>
        <Box display={"flex"} alignItems={"flex-start"}>
          {children}
          <div className="handle">
            <DragIndicatorIcon />
          </div>
        </Box>
      </Card>
    </Draggable>
  );
}
