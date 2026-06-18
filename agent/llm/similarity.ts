export function cosineSimilarity(
  a: number[],
  b: number[]
) {
    if (a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0,
    magA = 0,
    magB = 0;

  for (
    let i:number = 0;
    i < a.length ;
    i++
  ) {
     const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dot += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }

  return (
    dot /
    (Math.sqrt(magA) *
      Math.sqrt(magB))
  );
}