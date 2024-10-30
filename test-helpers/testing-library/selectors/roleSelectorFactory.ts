import { Screen, screen, waitForOptions } from "@testing-library/react";
import { from } from "../from";

type FunctionParams<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => infer R
  ? { params: P; returnType: R }
  : never;

type FindByRoleArgs<T extends (...args: unknown[]) => unknown> =
  | [...FunctionParams<T>["params"]]
  | [...FunctionParams<T>["params"], waitForOptions: waitForOptions];

interface RoleSelector<
  T extends (...args: unknown[]) => Parameters<(typeof screen)["getByRole"]>,
> {
  findBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FindByRoleArgs<T>
  ): Promise<THTMLElement>;
  findAllBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FindByRoleArgs<T>
  ): Promise<THTMLElement[]>;
  getBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FunctionParams<T>["params"]
  ): THTMLElement;
  getAllBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FunctionParams<T>["params"]
  ): THTMLElement[];
  queryBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FunctionParams<T>["params"]
  ): THTMLElement | null;
  queryAllBy<THTMLElement extends HTMLElement = HTMLElement>(
    ...args: FunctionParams<T>["params"]
  ): THTMLElement[];
  within(within: HTMLElement): Omit<RoleSelector<T>, "within">;
}

export const roleSelectorFactory = <
  T extends (...args: unknown[]) => Parameters<Screen["getByRole"]>,
>(
  parametersProvider: T,
) => {
  type BaseArgs = FunctionParams<T>["params"];
  type WithWaitForOptions = [...BaseArgs, waitForOptions];

  const getFindByRoleArgs = (...args: WithWaitForOptions) => {
    const numberOfParams = parametersProvider.length;
    const hasWaitForOptions = args.length > numberOfParams;

    // Extract parameters and waitForOptions (if provided)
    const withoutWaitForOptions = args.slice(
      0,
      numberOfParams,
    ) as FunctionParams<T>["params"];
    const waitForOptionsParam = hasWaitForOptions
      ? (args[numberOfParams] as waitForOptions)
      : undefined;

    // Get arguments from the parametersProvider
    const fullArgs: Parameters<(typeof screen)["findByRole"]> =
      parametersProvider(...withoutWaitForOptions);

    if (waitForOptionsParam) {
      fullArgs.push(waitForOptionsParam);
    }
    return fullArgs;
  };

  return () => {
    let withinElement: HTMLElement | undefined = undefined;
    const roleSelector: RoleSelector<T> = {
      findBy<THTMLElement extends HTMLElement = HTMLElement>(
        ...args: WithWaitForOptions
      ) {
        return from(withinElement).findByRole<THTMLElement>(
          ...getFindByRoleArgs(...args),
        );
      },
      findAllBy<THTMLElement extends HTMLElement = HTMLElement>(
        ...args: WithWaitForOptions
      ) {
        return from(withinElement).findAllByRole<THTMLElement>(
          ...getFindByRoleArgs(...args),
        );
      },
      getBy<THTMLElement extends HTMLElement = HTMLElement>(...args: BaseArgs) {
        const getByRoleArgs = parametersProvider(...args);
        return from(withinElement).getByRole<THTMLElement>(...getByRoleArgs);
      },
      getAllBy<THTMLElement extends HTMLElement = HTMLElement>(
        ...args: BaseArgs
      ) {
        const getByRoleArgs = parametersProvider(...args);
        return from(withinElement).getAllByRole<THTMLElement>(...getByRoleArgs);
      },
      queryBy<THTMLElement extends HTMLElement = HTMLElement>(
        ...args: BaseArgs
      ) {
        const getByRoleArgs = parametersProvider(...args);
        return from(withinElement).queryByRole<THTMLElement>(...getByRoleArgs);
      },
      queryAllBy<THTMLElement extends HTMLElement = HTMLElement>(
        ...args: BaseArgs
      ) {
        const getByRoleArgs = parametersProvider(...args);
        return from(withinElement).queryAllByRole<THTMLElement>(
          ...getByRoleArgs,
        );
      },
      within(within: HTMLElement): Omit<typeof roleSelector, "within"> {
        withinElement = within;
        return roleSelector;
      },
    };
    return roleSelector;
  };
};
