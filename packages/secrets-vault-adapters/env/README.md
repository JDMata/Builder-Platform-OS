# @sap-app-factory/adapter-secrets-vault-env

## Purpose
`SecretsVaultPort`'s first real adapter — the dev-only `.env`-default [BASELINE.md](../../../BASELINE.md) already documented as accepted technical debt, now actually implementing the port instead of composition-root code reading `process.env` directly and bypassing it. Built for VS-1's real Anthropic API call (`llm-adapters/anthropic`), which needed credentials read through the port, not hardcoded inline.

## Ports
Implements `SecretsVaultPort` (`@sap-app-factory/ports`).

## Scope and limitations
No rotation, no encryption at rest beyond whatever the process environment itself provides, no audit trail beyond process env. This is deliberately not a real secrets-management integration (AWS Secrets Manager, HashiCorp Vault, etc.) — per the Sprint 1 VS-1 Readiness Review, that remains triggered by a second provider type or a real secret-rotation need, neither of which this sprint introduces. Replacing this adapter with a real one requires no change to any caller — same port, same contract.
