const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../../tsconfig.json");

module.exports = {
  rootDir: "src",
  displayName: "Post Microservice",
  name: "Post Microservice",
  preset: "ts-jest",
  coveragePathIgnorePatterns: ["server.ts", "node_modules", "module.ts"],
  setupFilesAfterEnv: [
    "../../../tests/common-initialization.js",
    "../tests/initialization.js",
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../../../",
  }),
};