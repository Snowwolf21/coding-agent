import { useState } from "react";
import { 
  FaFileCode, 
  FaFileLines, 
  FaFileImage, 
  FaFile, 
  FaFolder, 
  FaFolderOpen 
} from "react-icons/fa6";
import type { WorkspaceFileNode } from "../types";

interface FileNodeProps {
  item: WorkspaceFileNode;
  onFileSelect: (selectedPath: string) => Promise<void> | void; 
  pathPrefix?: string;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return <FaFileCode className="w-4 h-4 text-blue-400 mr-2 shrink-0" />;
    case "js":
    case "jsx":
      return <FaFileCode className="w-4 h-4 text-yellow-400 mr-2 shrink-0" />;
    case "json":
      return <FaFileCode className="w-4 h-4 text-amber-500 mr-2 shrink-0" />;
    case "css":
      return <FaFileCode className="w-4 h-4 text-pink-400 mr-2 shrink-0" />;
    case "md":
      return <FaFileLines className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return <FaFileImage className="w-4 h-4 text-purple-400 mr-2 shrink-0" />;
    default:
      return <FaFile className="w-4 h-4 text-slate-400 mr-2 shrink-0" />;
  }
};

export default function FileNode({ item, onFileSelect, pathPrefix = "" }: FileNodeProps) {
  const [open, setOpen] = useState(false);
  const currentPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;

  const handleClick = () => {
    if (item.type === "folder") {
      setOpen(!open);
    } else {
      onFileSelect(currentPath); 
    }
  };

  return (
    <div className="ml-2 select-none">
      <div
        className="flex items-center cursor-pointer hover:bg-slate-800/60 p-1.5 rounded transition-all duration-150 ease-in-out text-slate-300 hover:text-white mb-0.5"
        onClick={handleClick}
      >
        {item.type === "folder" ? (
          open ? (
            <FaFolderOpen className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
          ) : (
            <FaFolder className="w-4 h-4 text-indigo-400 mr-2 shrink-0" />
          )
        ) : (
          getFileIcon(item.name)
        )}
        <span className="text-xs font-mono tracking-tight">{item.name}</span>
      </div>

      {open &&
        item.children?.map((child, i) => (
          <FileNode 
            key={i} 
            item={child} 
            onFileSelect={onFileSelect} 
            pathPrefix={currentPath} 
          />
        ))}
    </div>
  );
}
