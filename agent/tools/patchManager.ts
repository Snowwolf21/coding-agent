import fs from "fs";

export function applyPatch(
  path: string,
  content: string
) {
  const old =
    fs.readFileSync(
      path,
      "utf8"
    );

  fs.writeFileSync(
    path,
    content
  );

  return {
    old,
    updated: content,
  };
}