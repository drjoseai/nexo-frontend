import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Config files (CommonJS)
    "jest.config.js",
    "jest.setup.js",
    "postcss.config.js",
    "tailwind.config.js",
    // Scripts (CommonJS utilities)
    "scripts/**",
    // Generated files in public
    "public/*.js",
    // Coverage and reports
    "coverage/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
