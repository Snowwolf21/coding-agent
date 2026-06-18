import {
  execSync,
} from "child_process";

export function gitStatus() {
  return execSync(
    "git status --short",
    {
      encoding:
        "utf8",
    }
  );
}

export function gitCommit(
  message: string
) {
  execSync(
    "git add ."
  );

  execSync(
    `git commit -m "${message}"`,
    {
      stdio: "pipe",
    }
  );

  return "Commit created";
}