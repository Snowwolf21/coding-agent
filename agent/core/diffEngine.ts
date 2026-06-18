import {
  diffLines
} from "diff";

export function createDiff(
  oldText: string,
  newText: string
) {
  return diffLines(
    oldText,
    newText
  );
}

function login(user:string) {}