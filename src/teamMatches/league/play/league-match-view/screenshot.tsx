export const canvasToBlobAsync = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    });
  });
};

export async function screenshot() {
  const video = document.createElement("video");

  try {
    const captureStream = await navigator.mediaDevices.getDisplayMedia();
    const widths = captureStream
      .getVideoTracks()
      .map((track) => track.getSettings().width)
      .filter(Boolean) as unknown as number[];
    const width = Math.max(...widths);
    const heights = captureStream
      .getVideoTracks()
      .map((track) => track.getSettings().height)
      .filter(Boolean) as unknown as number[];

    const height = Math.max(...heights);

    video.srcObject = captureStream;
    video.autoplay = true;

    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const blob = await canvasToBlobAsync(canvas);
    captureStream.getTracks().forEach((track) => track.stop());
    return blob;
  } catch (err) {
    alert("Error: " + err);
  }
}
const timeoutPromise = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export async function screenshotToClipboard() {
  const blob = await screenshot();
  await timeoutPromise(1000);
  navigator.clipboard.write([new ClipboardItem({ "image/png": blob! })]);
}
