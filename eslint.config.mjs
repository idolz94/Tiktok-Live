import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...next,
  prettier,
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**", "coverage/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
