import { handleToolCall } from './agent/core/handleToolCall.js';

handleToolCall({
  name: "read_file",
  arguments: JSON.stringify({
    path: "code-ai-assistant/src/test.txt",
  }),
});
