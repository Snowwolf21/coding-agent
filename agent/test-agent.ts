import { handleToolCall } from './core/handleToolCall.js';

// Run your function call safely here
handleToolCall({
  name: "read_file",
  arguments: JSON.stringify({
    path: "src/test.txt",
  }),
});
