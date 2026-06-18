import fs from "fs";
import { listFiles } from "../tools/listFiles.js";
import { projectIndex } from "./projectIndex.js";

export async function buildProjectIndex() {
  const files = await listFiles();

  projectIndex.files = files.map((path) => ({
    path,
    content: fs.readFileSync(path, "utf8"),
  }));

  return projectIndex;
}