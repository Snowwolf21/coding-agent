export default function readFile(filePath: string): Promise<{
    success: boolean;
    data: string;
    error?: never;
} | {
    success: boolean;
    error: any;
    data?: never;
}>;
//# sourceMappingURL=readFile.d.ts.map