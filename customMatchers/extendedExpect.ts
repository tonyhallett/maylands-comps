import { toMatchWithGetters } from "./toMatchWithGetters";
import { expect as jestExpect } from "@jest/globals";
const customMatchers = {
  toMatchWithGetters,
};
jestExpect.extend(customMatchers);
export const expect = jestExpect as unknown as jest.ExtendedExpect<
  typeof customMatchers
>;
