import createShareButton from "./createShareButton";
import { objectToGetParams } from "./objectToGetParams";

function threadsLink(url: string, { title }: { title?: string }) {
  return (
    "https://threads.net/intent/post" +
    objectToGetParams({
      url,
      text: title,
    })
  );
}

const ThreadsShareButton = createShareButton<{
  title?: string;
  via?: string;
  hashtags?: string[];
  related?: string[];
}>(
  "threads",
  threadsLink,
  (props) => {
    if (props.title) {
      return {
        title: props.title,
      };
    }
    return {};
  },
  {
    windowWidth: 550,
    windowHeight: 600,
  },
);

export default ThreadsShareButton;
