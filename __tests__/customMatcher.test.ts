import { expect } from "../customMatchers/extendedExpect";
describe("toMatchWithGetters", () => {
  it("should work", () => {
    class Demo {
      get a() {
        return 1;
      }
    }
    expect({ a: 1 }).toMatchWithGetters(new Demo());

    expect({ a: 2 }).not.toMatchWithGetters(new Demo());
  });
});
