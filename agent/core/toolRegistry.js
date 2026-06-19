import readFile from "../tools/readFile.js";
import writeFile from "../tools/writeFile.js";
import { runCommand } from "../tools/terminal.js";
import { analyzeWorkingTree } from './analyzeWorkingTree.js';
import { semanticSearch } from "./semanticSearch.js";
import { projectIndex } from "./projectIndex.js";
import { addImport } from "../tools/astEdit.js";
import { runTests } from "../tools/runTests.js";
import { gitCommit, gitStatus } from "../tools/git.js";
export const toolRegistry = {
    readFile: ({ filePath }) => readFile(filePath),
    writeFile: ({ path, content }) => writeFile({ path, content }),
    run_command: async ({ command }) => await runCommand(command),
    analyze_working_tree: async () => {
        return analyzeWorkingTree();
    },
    semantic_search: ({ query }) => {
        return semanticSearch(query, projectIndex.files);
    },
    add_import: async ({ filePath, importName, moduleSpecifier, }) => {
        return await addImport(filePath, importName, moduleSpecifier);
    },
    run_tests: async () => {
        runTests();
    },
    git_status: () => gitStatus(),
    git_commit: ({ message, }) => gitCommit(message),
};
//# sourceMappingURL=toolRegistry.js.map