import dotenv from "dotenv";
import "./core/toolManager/registerTools.js";
import { orchestrate } from "./core/orchestrator.js";
dotenv.config();
export default async function agent(input) {
    return await orchestrate(input);
}
//# sourceMappingURL=agent.js.map