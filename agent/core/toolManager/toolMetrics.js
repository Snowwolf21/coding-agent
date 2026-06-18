export const metrics = [];
export function addMetric(metric) {
    metrics.push({
        ...metric,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=toolMetrics.js.map