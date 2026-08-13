import "dotenv/config";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  useESM: true,
}).transform;

/** @type {import("jest").Config} **/
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  verbose: true,
  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  collectCoverage: true,
};
