export interface Metric {
    tool: string;
    durationMs: number;
    success: boolean;
    timestamp: string;
}
export declare const metrics: Metric[];
export declare function addMetric(metric: Omit<Metric, "timestamp">): void;
//# sourceMappingURL=toolMetrics.d.ts.map