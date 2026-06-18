import fg from "fast-glob";

export async function listFiles() {
  return await fg(
    [
      "**/*.{ts,tsx,js,jsx,json,md}",
      "!node_modules/**",
      "!.git/**",
      "!dist/**",
      "!build/**",
    ],
    {
      dot: false,
    }
  );
}