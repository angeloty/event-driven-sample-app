const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../../tsconfig.json");

module.exports = {
  rootDir: "src",
  displayName: "User Microservice",
  name: "User Microservice",
  preset: "ts-jest",
  coveragePathIgnorePatterns: [
    "node_modules",
    "libs",
    "module.ts",
    "server.ts",
  ],
  setupFilesAfterEnv: [
    "../../../tests/common-initialization.js",
    "../tests/initialization.js",
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../../../",
  }),
};