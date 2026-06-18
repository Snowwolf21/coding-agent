const blockedTools =
  new Set([
    "delete_all_files",
  ]);

export function canUseTool(
  name: string
) {
  return !blockedTools.has(
    name
  );
}