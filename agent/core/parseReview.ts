
export default function parseReview(
  text: string
) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      passed: false,
      issues: [
        "Invalid review format"
      ],
    };
  }
}