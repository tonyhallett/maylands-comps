import { useLoaderData } from "react-router-dom";

export function useLoaderDataT<T>() {
  return useLoaderData() as T;
}
