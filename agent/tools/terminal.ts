import { exec } from "child_process";

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(`ERROR:\n${stderr || error.message}`);
        return;
      }

      resolve(stdout);
    });
  });
}