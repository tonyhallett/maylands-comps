import { useSubmit } from "react-router-dom";
import { SubmitOptions, SubmitTarget } from "react-router-dom/dist/dom";

export type SubmitJSONOptions = Omit<SubmitOptions, "method" | "encType">;

export function usePostJson() {
  const submit = useSubmit();
  return (target: SubmitTarget, postOptions?: SubmitJSONOptions) => {
    postOptions = postOptions || {};
    submit(target, {
      ...postOptions,
      method: "POST",
      encType: "application/json",
    });
  };
}

export function useDeleteJson() {
  const submit = useSubmit();
  return (target: SubmitTarget, deleteOptions?: SubmitJSONOptions) => {
    deleteOptions = deleteOptions || {};
    submit(target, {
      ...deleteOptions,
      method: "DELETE",
      encType: "application/json",
    });
  };
}
