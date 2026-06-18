type Review = {
  passed: boolean;
  issues: string[];
};

export function aggregateDebate(
  reviews: Review[]
) {
  const issues =
    reviews.flatMap(
      r => r.issues
    );

  return {
    passed:
      issues.length === 0,
    issues,
  };
}