import type { MatcherFunction } from "expect";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isEqualWith = require("lodash.isequalwith");

function listGetters(instance: object) {
  const ownPds = Object.getOwnPropertyDescriptors(
    Reflect.getPrototypeOf(instance),
  );
  return Object.entries(ownPds)
    .filter((e) => typeof e[1].get === "function" && e[0] !== "__proto__")
    .map((e) => e[0]);
}

function keysAndGetters(instance: object) {
  return Object.keys(instance).concat(listGetters(instance));
}

type Customizer = NonNullable<Parameters<typeof isEqualWith>[2]>;

const createCustomizer = (
  errorCallback: (key: string, actual: unknown, expected: unknown) => void,
) => {
  const customizer: Customizer = (a, b) => {
    if (typeof a === "function" && typeof b === "function") {
      return true;
    } else if (typeof a === "object" && typeof b === "object") {
      const aKeys = keysAndGetters(a);
      const bKeys = keysAndGetters(b);
      return (
        aKeys.length === bKeys.length &&
        aKeys.every((key) => {
          const equal = isEqualWith(a[key], b[key], customizer);
          if (!equal) {
            errorCallback(key, a[key], b[key]);
          }
          return equal;
        })
      );
    }
  };
  return customizer;
};

export const toMatchWithGetters: MatcherFunction<[expected: unknown]> = (
  actual,
  expected,
) => {
  const errorKeys: string[] = [];
  let isFirst = true;
  let errorActual: unknown | undefined;
  let errorExpected: unknown | undefined;
  const customizer = createCustomizer((key, actual, expected) => {
    errorKeys.push(key);
    if (isFirst) {
      errorActual = actual;
      errorExpected = expected;
      isFirst = false;
    }
  });
  const pass = isEqualWith(actual, expected, customizer);
  if (pass) {
    return {
      pass: true,
      message: () => "pass",
    };
  } else {
    const keysMessage = errorKeys.reverse().join(".");
    return {
      pass: false,
      message: () =>
        `fail, keys - ${keysMessage}. Actual - ${errorActual}, Expected - ${errorExpected}`,
    };
  }
};
