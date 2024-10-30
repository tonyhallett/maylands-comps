import createShareButton from "./createShareButton";
import { objectToGetParams } from "./objectToGetParams";
interface Options {
  body?: string;
  separator?: string;
}
// adjusted from https://github.com/nygardk/react-share/pull/390
// https://stackoverflow.com/questions/6480462/how-to-pre-populate-the-sms-body-text-via-an-html-link
function smsLink(url: string, _a: Options) {
  const body = _a.body,
    separator = _a.separator;
  return (
    //"sms:" +
    "sms:?" +
    objectToGetParams({ body: body ? body + separator + url : url }).replace(
      /^\?/,
      "&",
    )
  );
}
const SMSShareButton = createShareButton<{ body?: string; separator?: string }>(
  "sms",
  smsLink,
  function (props) {
    return {
      body: props.body || "",
      separator: props.separator || " ",
    };
  },
  {
    openShareDialogOnClick: false,
    onClick: function (_, link) {
      window.location.href = link;
    },
  },
);
export default SMSShareButton;
