import readFile from "../agent/tools/readFile.js";

const result = await readFile("package.json");

console.log(result);