# @sap-app-factory/plugin-fiori-generator

## Purpose
The Sprint 0 example `CapabilityPlugin` (ADR-0006) — proves the `plugin-sdk` contract holds end to end. No Fiori/SAPUI5 generation logic exists yet: `generate()` returns `[]`.

## Contract
Implements `CapabilityPlugin` from `@sap-app-factory/plugin-sdk`. Passes `testing-kit`'s `capabilityPluginContractTests` for real — not a fake standing in for a future implementation.

## Sprint 0 scope
Manifest only (`producesArtifactTypes: ["fiori-elements-app"]`, `supportedExecutionProfiles: ["local-poc"]`). `activate()`/`deactivate()` resolve immediately; `validate()` always reports valid; `generate()` always returns an empty array. Real generation logic, plugin loading (`orchestrator`), and process/container isolation are out of scope here — see `plugin-sdk`'s README.
