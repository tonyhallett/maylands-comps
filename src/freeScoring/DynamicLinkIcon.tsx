import { IconButton } from "@mui/material";
import { CSSProperties } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
interface DynamicLinkIconButtonProps extends NavLinkProps {
  icon: React.ReactNode;
  activeColor: CSSProperties["color"];
  inactiveColor: CSSProperties["color"];
}

export default function DynamicLinkIcon(props: DynamicLinkIconButtonProps) {
  const { icon, activeColor, inactiveColor, ...navLinkProps } = props;
  return (
    <NavLink {...navLinkProps}>
      {(navLinkRenderProps) => {
        const { isActive } = navLinkRenderProps;
        return (
          <IconButton
            sx={{
              border: 1,
              borderRadius: 1,
              color: isActive ? activeColor : inactiveColor,
            }}
          >
            {icon}
          </IconButton>
        );
      }}
    </NavLink>
  );
}
