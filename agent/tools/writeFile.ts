import fs from "fs";

export  default function writeFile({ path, content }: { path: string; content: string }) {
  const backupPath = path + ".backup";

  // backup first
  if (fs.existsSync(path)) {
    fs.copyFileSync(path, backupPath);
  }

  fs.writeFileSync(path, content);

  return `Updated ${path} (backup created)`;
}