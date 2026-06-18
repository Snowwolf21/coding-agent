import {
  execSync,
} from "child_process";



export function runTests() {
  try {
    const result =
      execSync(
        "npm test",
        {
          encoding:
            "utf8",
        }
      );

    return {
      passed: true,
      output: result,
    };
  } catch (e: any) {
    return {
      passed: false,
      output:
        e.stdout ||
        e.message,
    };
  }
}