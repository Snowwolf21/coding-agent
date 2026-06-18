export type ToolResult = {
  success: boolean;
  output: any;
  error?: string;
  durationMs: number;
};

export interface Tool {
  name: string;
  execute(args: any): Promise<any>;
}