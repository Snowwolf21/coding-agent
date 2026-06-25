import { useState, useRef, useEffect } from "react";
import getLanguageByExtension from "./getLanguageExtention.js";

export function useMonacoEditor() {
  const [code, setCode] = useState(`// Welcome to Monaco Editor!\n// Open a file from the explorer or ask the AI to write some code.`);
  const [filePath, setFilePath] = useState("package.json");
  const editorRef = useRef<any>(null);
  
  // ✨ FIX: Use a React Ref instead of an element ID for infallible mounting
  const containerRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    // Check if the actual DOM node ref exists
    if (containerRef.current && window.monaco && !editorRef.current) {
      window.monaco.editor.defineTheme("agentDark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "keyword", foreground: "569CD6", fontStyle: "bold" }
        ],
        colors: {
          "editor.background": "#1e293b", 
          "editor.lineHighlightBackground": "#334155" 
        }
      });

      // Mount directly onto the React reference element container
      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value: code,
        language: getLanguageByExtension(filePath),
        theme: "agentDark",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true }
      });

      editorRef.current.onDidChangeModelContent(() => {
        setCode(editorRef.current.getValue());
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []); // Runs safely once on structural mount

  return {
    code,
    setCode,
    filePath,
    setFilePath,
    editorRef,
    containerRef // ✨ Return the ref target to bind to your layout JSX
  };
}
