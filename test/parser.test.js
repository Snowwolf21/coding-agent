import { parseLLMJson } from "../agent/utils/jsonParser.js";
const text = `
\`\`\`json
{
  "type":"tool_call",
  "tool":"readFile",
  "arguments":{
    "filePath":"package.json"
  }
}
\`\`\`
`;
console.log(parseLLMJson(text));
//# sourceMappingURL=parser.test.js.map