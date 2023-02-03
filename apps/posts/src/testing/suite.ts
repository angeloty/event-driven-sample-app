import { Application } from "@ten-kc/core";
import { DatabaseModule } from "@ten-kc/database";
import { application } from "./server";

export namespace TestSuite {
  export const init = (): Application => {
    beforeAll(async () => await application.init(process.env.PORT || 80));
    /**
     * Clear all test data after every test.
     */
    afterEach(
      async () =>
        await (application.getModule(DatabaseModule) as DatabaseModule).clean()
    );

    /**
     * Remove and close the db and server.
     */
    afterAll(async () => await application.destroy());
    return application;
  };
}