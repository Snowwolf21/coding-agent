import { registerTool } from "./toolRegistry.js";
import fs from "fs";
import { execSync } from "child_process";

registerTool({
  name: "read_file",
  async execute({ path }) {
    return fs.readFileSync(path, "utf8");
  },
});

registerTool({
  name: "write_file",
  async execute({ path, content }) {
    fs.writeFileSync(path, content);
    return "File written";
  },
});

registerTool({
  name: "run_tests",
  async execute() {
    return execSync("npm test", {
      encoding: "utf8",
    });
  },
});