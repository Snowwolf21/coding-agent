export function compressMemory(
  history: any[]
) {
  if (history.length < 20) {
    return history;
  }

  return [
    {
      role: "system",
      content:
        "Previous conversation summarized.",
    },
    ...history.slice(-10),
  ];
}