import { useRef } from "react";
import { useLoaderDataT } from "./useLoaderDataT";

export function useLoaderDataOnce<T>(render: (loaderData: T) => JSX.Element) {
  const lastRenderRef = useRef<JSX.Element | undefined>(undefined);
  const lastLoaderData = useRef<T | undefined>(undefined);
  const loaderData = useLoaderDataT<T>();
  let sameData = false;
  if (lastLoaderData.current !== undefined) {
    sameData = lastLoaderData.current === loaderData;
  }
  lastLoaderData.current = loaderData;
  if (sameData) {
    return lastRenderRef.current;
  } else {
    const component = render(loaderData);
    lastRenderRef.current = component;
    return component;
  }
}
