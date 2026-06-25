import fs from "fs/promises";
export default async function readFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return {
            success: true,
            data
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
//# sourceMappingURL=readFile.js.map