import { OllamaProvider } from "../agent/llm/ollamaProvider.js";
async function runTest() {
    console.log("🚀 Starting Ollama Provider Test...");
    const provider = new OllamaProvider();
    // Test Case 1: Simple Hello
    try {
        console.log("\n📡 Sending test message to Ollama...");
        const result = await provider.generate([
            { role: "user", content: "Say 'Hello world' and nothing else." }
        ]);
        console.log("✅ TEST SUCCESSFUL!");
        console.log("🤖 LLM Response:", result.text);
    }
    catch (error) {
        console.error("❌ TEST FAILED!");
        console.error("💀 Error Message:", error.message);
        if (error.stack) {
            console.error("📍 Stack Trace:\n", error.stack);
        }
    }
}
runTest();
//# sourceMappingURL=test-ollama.js.map