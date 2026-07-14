import { mcpConnectionContractTests } from "@sap-app-factory/testing-kit";
import { StdioMcpAdapter } from "./stdio-mcp-adapter.js";

// The real proof the contract-test harness works: this is not a fake, it's
// the actual adapter this package ships.
mcpConnectionContractTests(() => new StdioMcpAdapter());
