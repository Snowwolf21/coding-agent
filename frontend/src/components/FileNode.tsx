import { useState } from "react";
import { Icons } from "./Icons.js";
import type { WorkspaceFileNode } from "../types";

// Explicit property validation interface
interface FileNodeProps {
  item: WorkspaceFileNode;
  // FIX: Explicitly type the file loading callback signature
  onFileSelect: (selectedPath: string) => Promise<void> | void; 
}
const { Folder:FolderIcon, File:FileIcon } = Icons
export default function FileNode({ item, onFileSelect }: FileNodeProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (item.type === "folder") {
      setOpen(!open);
    } else {
      // FIX: Triggers parent workspace loader with the target path string
      onFileSelect(item.name); 
    }
  };

  return (
    <div className="ml-2">
      <div
        className="flex items-center cursor-pointer hover:bg-slate-800 p-1 rounded"
        onClick={handleClick}
      >
        {item.type === "folder" ? <FolderIcon /> : <FileIcon name={item.name} />}
        <span className="text-xs">{item.name}</span>
      </div>

      {/* FIX: Ensure nested children receive the property callback recursively */}
      {open &&
        item.children?.map((child, i) => (
          <FileNode key={i} item={child} onFileSelect={onFileSelect} />
        ))}
    </div>
  );
}
