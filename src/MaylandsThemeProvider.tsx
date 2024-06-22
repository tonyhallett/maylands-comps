import { LinkProps } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { forwardRef, PropsWithChildren } from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
// eslint-disable-next-line react/display-name
const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (Material UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#271A45",
    },
    secondary: {
      main: "#99CC99",
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
});

interface MaylandsThemeProviderProps {}
export default function MaylandsThemeProvider({
  children,
}: PropsWithChildren<MaylandsThemeProviderProps>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
