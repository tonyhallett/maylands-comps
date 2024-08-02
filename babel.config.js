// eslint-disable-next-line no-undef
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
    ["@babel/plugin-proposal-decorators", { version: "legacy" }],
  ],
};
