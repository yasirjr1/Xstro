import { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";

const eslintConfig: FlatConfig.Config = {
     languageOptions: {
          ecmaVersion: "latest" as const,
          sourceType: "module" as const,
          parser: tsParser,
          globals: {},
     },
     plugins: {
          prettier,
     },
     rules: {
          "prettier/prettier": [
               "error",
               {
                    printWidth: 120,
                    useTabs: false,
                    tabWidth: 5,
                    singleQuote: false,
                    semi: true,
                    quoteProps: "as-needed" as const,
                    trailingComma: "es5" as const,
                    bracketSpacing: true,
                    bracketSameLine: false,
                    arrowParens: "always" as const,
                    endOfLine: "auto" as const,
                    proseWrap: "always" as const,
               },
          ],
     },
     files: ["**/*.mts"],
     ignores: ["node_modules/**", "release/**"],
};

export default eslintConfig;
