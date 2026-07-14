import { capabilityPluginContractTests } from "@sap-app-factory/testing-kit";
import { FioriGeneratorPlugin } from "./fiori-generator-plugin.js";

// The real proof the contract-test harness works: this is not a fake, it's
// the actual plugin this package ships.
capabilityPluginContractTests(() => new FioriGeneratorPlugin());
