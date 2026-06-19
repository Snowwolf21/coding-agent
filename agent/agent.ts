import { OllamaProvider } from "./llm/ollamaProvider.js";
import { parseLLMJson } from "./utils/jsonParser.js";
import { executeTool } from "./tools/executeTool.js";

const MAX_ITERATIONS = 10;

export async function agent(messages: any[]): Promise<any> {
  const provider = new OllamaProvider();

  // Ensure system prompt exists
  if (
    !messages.some(
      (msg) => msg.role === "system"
    )
  ) {
    messages.unshift({
      role: "system",
      content: `
You are an autonomous coding agent.

You MUST respond ONLY with valid JSON.

Tool call format:

{
  "type": "tool_call",
  "tool": "readFile",
  "arguments": {
    "filePath": "package.json"
  }
}

Final answer format:

{
  "type": "final",
  "content": "Your answer here"
}

Rules:
- Never explain your reasoning.
- Never use markdown.
- Never wrap JSON in backticks.
- Always choose a tool if one is needed.
- Continue until the task is completed.
`
    });
  }

  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    console.log(
      `\n🔄 Agent Iteration ${iteration}`
    );
     console.log(
  "\n📨 Sending to LLM...");
    // Call Ollama
    const response =
      await provider.generate(messages);

    console.log(
      "\n🧠 Raw Model Response:"
    );
    console.log(response.text);

    let action;

    try {
      action = parseLLMJson(
        response.text
      );
    } catch (error: any) {
      throw new Error(
        `Model did not return valid JSON:\n\n${response.text}\n\nReason: ${error.message}`
      );
    }

    // TOOL CALL
    if (
      action.type === "tool_call"
    ) {
      const toolName =
        action.tool;

      const toolArgs =
        action.arguments || {};

      console.log(
        `\n🛠 Executing Tool: ${toolName}`
      );

      const tool =
  await executeTool(
    toolName,
    toolArgs
  );

      if (!tool) {
        throw new Error(
          `Unknown tool requested: ${toolName}`
        );
      }

      const result =
         tool;

      console.log(
        "\n✅ Tool Result:"
      );
      console.log(result);

      // Add assistant tool request
      messages.push({
        role: "assistant",
        content: response.text
      });

      // Feed tool result back
      messages.push({
        role: "user",
        content:
          `Tool execution result:\n${JSON.stringify(
            result,
            null,
            2
          )}`
      });

      continue;
    }

    // FINAL ANSWER
    if (
      action.type === "final"
    ) {
      console.log(
        "\n🤖 Final Answer:"
      );
      console.log(
        action.content
      );

      return action.content;
    }

    throw new Error(
      `Unexpected response type: ${action.type}`
    );
  }

  throw new Error(
    `Agent exceeded maximum iterations (${MAX_ITERATIONS})`
  );
}