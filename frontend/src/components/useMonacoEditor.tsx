import { useState } from "react";

export function useMonacoEditor() {
  const [code, setCode] = useState(`// Welcome to Monaco Editor!\n// Open a file from the explorer or ask the AI to write some code.`);
  const [filePath, setFilePath] = useState("package.json");

  return {
    code,
    setCode,
    filePath,
    setFilePath
  };
}
