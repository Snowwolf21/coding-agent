 // TYPE FIX: Explicit string typing for path parameter
 export default function getLanguageByExtension(path: string): string {
    const ext = path.split(".").pop();
    switch (ext) {
      case "ts": return "typescript";
      case "tsx": return "typescript";
      case "js": return "javascript";
      case "jsx": return "javascript";
      case "json": return "json";
      case "css": return "css";
      case "html": return "html";
      case "md": return "markdown";
      default: return "plaintext";
    }
  }