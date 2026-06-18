import { Project } from "ts-morph";
import auth from "../core/auth.js";

const project = new Project();

export async function addImport(
  filePath: string,
  importName: string,
  moduleSpecifier: string
): Promise<string> {
  const sourceFile = project.addSourceFileAtPath(filePath);

  sourceFile.addImportDeclaration({
    namedImports: [importName],
    moduleSpecifier,
  });

  await sourceFile.save();
  return "Import added";
}

// 💡 FIXED: Wrapped arguments in string quotes ("") so they aren't parsed as numbers/math!
// 💡 FIXED: Moved the test call OUTSIDE of the function body to prevent infinite recursion loop crashes.
async function runTest() {
  await addImport(
    "src/auth.ts",      // ✅ Now correctly read as a string path
    "jwt",              // ✅ String literal
    "jsonwebtoken"      // ✅ String literal
  );
}
