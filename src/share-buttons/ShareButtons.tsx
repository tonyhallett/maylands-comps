import { Box, Stack } from "@mui/material";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  WhatsappIcon,
  XIcon,
} from "react-share";
import { SocialIcon } from "react-social-icons";
import ThreadsShareButton from "./ThreadsButton";
import SMSShareButton from "./SMSShareButton";
import SMSIcon from "./SMSIcon";

const maylandsCompsUrl = "https://maylands-comps.web.app/";
const subject = "Score Maylands matches and watch live !";
const hashTagSuffix = "Maylands_Green_Live_Matches";
export function ShareButtons() {
  return (
    <Stack direction="row" spacing={1}>
      <Box
        display={{
          xs: "block",
          sm: "block",
          md: "block",
          lg: "none",
          xl: "none",
        }}
      >
        <SMSShareButton body={subject} url={maylandsCompsUrl}>
          <SMSIcon
            size={32}
            round
            iconFillColor="black"
            bgStyle={{ fill: "white" }}
          />
        </SMSShareButton>
      </Box>
      <EmailShareButton subject={subject} url={maylandsCompsUrl}>
        <EmailIcon size={32} round />
      </EmailShareButton>
      <WhatsappShareButton title={subject} url={maylandsCompsUrl}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <FacebookShareButton
        hashtag={`${subject} #${hashTagSuffix}`}
        url={maylandsCompsUrl}
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton
        url={maylandsCompsUrl}
        title={subject}
        hashtags={[hashTagSuffix]}
      >
        <XIcon
          size={32}
          round
          iconFillColor="black"
          bgStyle={{ fill: "white" }}
        />
      </TwitterShareButton>
      <ThreadsShareButton title={subject} url={maylandsCompsUrl}>
        <SocialIcon
          bgColor="white"
          fgColor="black"
          style={{ width: 32, height: 32, verticalAlign: "baseline" }}
          network="threads"
        />
      </ThreadsShareButton>
    </Stack>
  );
}
