import { useEffect } from "react";

export function SubscribeMaylandsYoutubeButton() {
  // style is important
  // https://stackoverflow.com/questions/73590803/remove-white-corners-on-the-embedded-youtube-subscribe-button/79138621#79138621
  return (
    <div style={{ colorScheme: "normal" }}>
      <YoutubeSubscribeButton
        dataChannelOrChannelId="UCmicLP8Owcuxu1KcWFfVlIg"
        isDataChannelId
        dataTheme="dark"
        dataCount="hidden"
      />
    </div>
  );
}

type DataLayout = "default" | "full";
type DataTheme = "default" | "dark";
type DataCount = "default" | "hidden";
interface YoutubeMarkerAttributes {
  dataLayout?: DataLayout;
  dataTheme?: DataTheme;
  dataCount?: DataCount;
  isDataChannelId: boolean;
  dataChannelOrChannelId: string;
}

const useScript = (url) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [url]);
};

function YoutubeSubscribeButton({
  isDataChannelId,
  dataChannelOrChannelId,
  dataCount,
  dataLayout,
  dataTheme,
}: YoutubeMarkerAttributes) {
  useScript("https://apis.google.com/js/platform.js");
  return (
    <div
      className="g-ytsubscribe"
      data-channelid={isDataChannelId ? dataChannelOrChannelId : undefined}
      data-channel={isDataChannelId ? undefined : dataChannelOrChannelId}
      data-count={dataCount}
      data-theme={dataTheme}
      data-layout={dataLayout}
    ></div>
  );
}
