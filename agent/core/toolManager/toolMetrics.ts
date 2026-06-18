export interface Metric {
  tool: string;
  durationMs: number;
  success: boolean;
  timestamp: string;
}

export const metrics: Metric[] = [];

export function addMetric(
  metric: Omit<Metric, "timestamp">
) {
  metrics.push({
    ...metric,
    timestamp: new Date().toISOString(),
  });
}