import type { JestConfigWithTsJest } from "ts-jest";

import { pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "../../tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s?$": [
      "ts-jest",
      {
        tsconfig: "./apps/posts/tsconfig.test.json",
      },
    ],
  },
  rootDir: ".",
  moduleFileExtensions: ["ts", "tsx", "js"],
  coverageDirectory: "../../coverage/apps/posts",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../../",
  }),
};
export default jestConfig;