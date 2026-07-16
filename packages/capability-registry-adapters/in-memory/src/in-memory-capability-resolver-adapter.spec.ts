import { registerCapabilityProvider } from "@sap-app-factory/context-capability-registry";
import { capabilityResolverContractTests } from "@sap-app-factory/testing-kit";
import { InMemoryCapabilityResolverAdapter } from "./in-memory-capability-resolver-adapter.js";

const requirementsAnalystProvider = registerCapabilityProvider({
  id: "requirements-analyst-provides-structure-business-requirement",
  capabilityId: "structure-business-requirement",
  providerType: "agent",
  providerId: "requirements-analyst",
  providerVersion: 1,
  priority: 1,
});

capabilityResolverContractTests(
  () => new InMemoryCapabilityResolverAdapter([requirementsAnalystProvider]),
  {
    registeredCapabilityId: "structure-business-requirement",
    unregisteredCapabilityId: "generate-functional-specification",
    expectedProviderId: "requirements-analyst",
  },
);
