const colors = {
  red: "\x1b[31m%s\x1b[0m",
  green: "\x1b[32m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  blue: "\x1b[34m%s\x1b[0m",
  magenta: "\x1b[35m%s\x1b[0m",
  cyan: "\x1b[36m%s\x1b[0m",
};

export class Logger {
  static log(
    module: string,
    message: string,
    color: "yellow" | "green" | "red" | "magenta" | "blue" = "blue"
  ) {
    console.log(
      `${colors.yellow.replace("%s", new Date().toISOString())}`,
      `${colors.blue.replace("%s", module)} => `,
      `${colors[color].replace("%s", message)}`
    );
  }
  static info(
    module: string,
    message: string,
    color: "yelow" | "green" | "red" | "magenta" | "blue" = "green"
  ) {
    console.info(
      `${colors.yellow.replace("%s", new Date().toISOString())}`,
      `${colors.cyan.replace("%s", module)} => `,
      `${colors[color].replace("%s", message)}`
    );
  }
  static error(
    module: string,
    message: string,
    color: "yelow" | "green" | "red" | "magenta" | "blue" = "red"
  ) {
    console.error(
      `${colors.yellow.replace("%s", new Date().toISOString())}`,
      `${colors.magenta.replace("%s", module)} => `,
      `${colors[color].replace("%s", message)}`
    );
  }
}