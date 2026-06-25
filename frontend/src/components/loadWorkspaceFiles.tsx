import type { WorkspaceFile } from "../types";

const API_BASE = "http://127.0.0.1:3001";

const FALLBACK_FILES: WorkspaceFile[] = [
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
    {
      name: "agent",
      type: "folder",
      children: [
        { name: "orchestrator.ts", type: "file" },
        { name: "agent.ts", type: "file" },
      ],
    },
    {
      name: "src",
      type: "folder",
      children: [
        { name: "index.ts", type: "file" },
      ],
    },
  ];

// Load files list from host filesystem API.
export async function loadWorkspaceFiles(): Promise<WorkspaceFile[]> {
  try {
    const response = await fetch(`${API_BASE}/list-files`);

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files;
      }
    }
  } catch (err) {
    console.warn("Could not load dynamic workspace files, using mock hierarchy:", err);
  }

  return FALLBACK_FILES;
}
