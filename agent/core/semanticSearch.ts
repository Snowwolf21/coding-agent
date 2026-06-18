import Fuse from "fuse.js";

type SearchableFile = {
  path: string;
  content: string;
};

export function semanticSearch(
  query: string,
  files: SearchableFile[]
) {
  const fuse = new Fuse(files, {
    keys: ["path", "content"],
    threshold: 0.3,
    includeScore: true,
  });

  return JSON.stringify(fuse.search(query));
}
