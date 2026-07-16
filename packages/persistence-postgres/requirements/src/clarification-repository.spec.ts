import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Clarification } from "@sap-app-factory/context-requirements";
import { createTestRequestContext, repositoryContractTests } from "@sap-app-factory/testing-kit";
import { ClarificationRepository } from "./clarification-repository.js";

const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "ClarificationRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let adminPool: Pool;
    let appPool: Pool;

    beforeAll(async () => {
      adminPool = new Pool({ connectionString: adminConnectionString });
      appPool = new Pool({ connectionString: appConnectionString });
      await migrate(drizzle(adminPool), {
        migrationsFolder: "./migrations",
        migrationsTable: "requirements_migrations",
      });
    });

    afterAll(async () => {
      await adminPool.end();
      await appPool.end();
    });

    beforeEach(async () => {
      await adminPool.query('TRUNCATE TABLE "requirements"."clarifications"');
    });

    repositoryContractTests<Clarification, string>(() => new ClarificationRepository(appPool), {
      makeId: () => `clar-${randomUUID()}`,
      buildAggregate: (id) => ({
        id,
        requirementDocumentId: "doc-1",
        question: "What counts as a discrepancy over threshold?",
        sourceFragment: "flag discrepancies over a threshold",
        relatedRequirementIds: [],
        answer: undefined,
        status: "unanswered",
      }),
      mutateAggregate: (clarification) => ({
        ...clarification,
        answer: "Over 5 units or 2%, whichever is greater",
        status: "answered",
      }),
      toComparable: (clarification) => clarification,
    });

    it("round-trips relatedRequirementIds as a real Postgres array column", async () => {
      const repo = new ClarificationRepository(appPool);
      const ctx = createTestRequestContext({ tenantId: "clar-array-tenant" });
      const id = `clar-${randomUUID()}`;

      await repo.save(ctx, {
        id,
        requirementDocumentId: "doc-1",
        question: "x",
        sourceFragment: "y",
        relatedRequirementIds: ["req-1", "req-2"],
        answer: undefined,
        status: "unanswered",
      });

      const found = await repo.findById(ctx, id);
      expect(found?.relatedRequirementIds).toEqual(["req-1", "req-2"]);
    });

    it("findByRequirementDocumentId returns only that document's clarifications, tenant-scoped", async () => {
      const repo = new ClarificationRepository(appPool);
      const ctx = createTestRequestContext({ tenantId: "clar-doc-scope-tenant" });

      await repo.save(ctx, {
        id: `clar-${randomUUID()}`,
        requirementDocumentId: "doc-scoped",
        question: "in scope",
        sourceFragment: "x",
        relatedRequirementIds: [],
        answer: undefined,
        status: "unanswered",
      });
      await repo.save(ctx, {
        id: `clar-${randomUUID()}`,
        requirementDocumentId: "doc-other",
        question: "different document",
        sourceFragment: "x",
        relatedRequirementIds: [],
        answer: undefined,
        status: "unanswered",
      });

      const found = await repo.findByRequirementDocumentId(ctx, "doc-scoped");
      expect(found).toHaveLength(1);
      expect(found[0]?.question).toBe("in scope");
    });
  },
);
