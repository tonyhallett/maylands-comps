import { Ref, forwardRef } from "react";

import ShareButton, { Props as ShareButtonProps } from "./ShareButton";

function createShareButton<
  OptionProps extends Record<string, unknown>,
  LinkOptions extends Record<string, unknown> = OptionProps,
>(
  networkName: string,
  link: (url: string, options: LinkOptions) => string,
  optsMap: (props: OptionProps) => LinkOptions,
  defaultProps: Partial<ShareButtonProps<LinkOptions> & OptionProps>,
) {
  type Props = Omit<
    ShareButtonProps<LinkOptions>,
    "forwardedRef" | "networkName" | "networkLink" | "opts"
  > &
    OptionProps;

  function CreatedButton(props: Props, ref: Ref<HTMLButtonElement>) {
    const opts = optsMap(props);
    const passedProps = { ...props };

    // remove keys from passed props that are passed as opts
    const optsKeys = Object.keys(opts);
    optsKeys.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete passedProps[key];
    });

    return (
      <ShareButton<LinkOptions>
        {...defaultProps}
        {...passedProps}
        forwardedRef={ref}
        networkLink={link}
        opts={optsMap(props)}
      />
    );
  }

  CreatedButton.displayName = `ShareButton-${networkName}`;

  return forwardRef(CreatedButton);
}

export default createShareButton;
