import next from "eslint-config-next";
import prettier from "eslint-config-prettier";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = [
  ...next,
  prettier,
  {
    ...tailwindcss.configs.recommended,
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/no-arbitrary-value": "off",
    },
  },
  {
    ignores: [".next/**", ".claude/**", "node_modules/**", "dist/**", "build/**", "coverage/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
