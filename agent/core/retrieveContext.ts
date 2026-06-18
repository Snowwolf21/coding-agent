import Fuse from "fuse.js";
import {
  projectIndex,
} from "./projectIndex.js";

export function retrieveContext(
  query: string
) {
  const fuse =
    new Fuse(
      projectIndex.files,
      {
        keys: [
          "path",
          "content",
        ],
        threshold:
          0.3,
      }
    );

  return fuse
    .search(query)
    .slice(0, 5);
}