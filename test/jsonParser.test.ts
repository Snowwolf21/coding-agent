import assert from "assert";
import { parseLLMJson } from "../agent/utils/jsonParser.js";

describe("JSON Parser Utility", () => {
  it("should parse standard JSON text", () => {
    const raw = '{"type": "final", "content": "Hello"}';
    const parsed = parseLLMJson(raw);
    assert.deepStrictEqual(parsed, { type: "final", content: "Hello" });
  });

  it("should strip markdown JSON wrappers", () => {
    const raw = '```json\n{"type": "tool_call", "tool": "test"}\n```';
    const parsed = parseLLMJson(raw);
    assert.deepStrictEqual(parsed, { type: "tool_call", tool: "test" });
  });

  it("should throw error if JSON is missing block boundaries", () => {
    const raw = "hello world";
    assert.throws(() => parseLLMJson(raw), /No JSON object found/);
  });
});
