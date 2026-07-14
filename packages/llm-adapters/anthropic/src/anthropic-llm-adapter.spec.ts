import { llmProviderContractTests } from "@sap-app-factory/testing-kit";
import { AnthropicLlmAdapter } from "./anthropic-llm-adapter.js";

// The real proof the contract-test harness works: this is not a fake, it's
// the actual adapter this package ships.
llmProviderContractTests(() => new AnthropicLlmAdapter());
