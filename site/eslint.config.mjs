import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

// Direct plugin imports rather than eslint-config-next's full preset.
// FlatCompat's validator has a circular-JSON crash when react plugin is
// loaded transitively, so we wire only the rules we actually use:
//   @next/next/no-img-element  — referenced by `// eslint-disable-next-line`
//                                 comments on intentional <img> usages
//   react-hooks/exhaustive-deps — referenced by `// eslint-disable-next-line`
//                                 comments on intentional dep-omission
// Both plugins are pulled in transitively by eslint-config-next 16.2.2.
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [".next/", "node_modules/"],
  },
];
