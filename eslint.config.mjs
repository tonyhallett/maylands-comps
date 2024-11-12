import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import jsxRuntimeConfig from "eslint-plugin-react/configs/jsx-runtime.js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginJest from "eslint-plugin-jest";

function updateToFlatConfig(...configs) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const compat = new FlatCompat({
    baseDirectory: __dirname,
  });
  return compat.extends(...configs);
}

const reactHooks = updateToFlatConfig("plugin:react-hooks/recommended")[0];

const testFiles = [
  "__tests__/**",
  "__emulator-tests__/**",
  "__hacky-mui-tests__/**",
];

export default [
  { ignores: ["dist/**", "public/**", ".husky/**", ".parcel-cache/**"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  //todo go strict
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    ...pluginReactConfig,
  },
  {
    files: testFiles,
    ...pluginJest.configs["flat/style"],
  },
  {
    files: testFiles,
    ...pluginJest.configs["flat/recommended"],
    rules: {
      ...pluginJest.configs["flat/recommended"].rules,
      "jest/no-standalone-expect": "off",
      "jest/no-conditional-expect": "off",
      "jest/expect-expect": [
        "warn",
        { assertFunctionNames: ["expect", "expect*"] },
      ],
    },
  },
  jsxRuntimeConfig,
  reactHooks,
  eslintConfigPrettier,
];
