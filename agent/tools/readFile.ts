import fs from "fs/promises";

export default async function readFile(filePath: string) {
  try {
    const data = await fs.readFile(filePath, "utf-8");

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}