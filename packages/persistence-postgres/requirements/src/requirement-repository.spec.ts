import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Requirement } from "@sap-app-factory/context-requirements";
import { createTestRequestContext, repositoryContractTests } from "@sap-app-factory/testing-kit";
import { RequirementRepository } from "./requirement-repository.js";

const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "RequirementRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
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
      await adminPool.query('TRUNCATE TABLE "requirements"."requirements"');
    });

    repositoryContractTests<Requirement, string>(() => new RequirementRepository(appPool), {
      makeId: () => `req-${randomUUID()}`,
      buildAggregate: (id) => ({
        id,
        requirementDocumentId: "doc-1",
        kind: "functional",
        description: "Reconcile physical stock counts against SAP inventory.",
        status: "draft",
      }),
      mutateAggregate: (requirement) => ({ ...requirement, status: "approved" }),
      toComparable: (requirement) => requirement,
    });

    it("findByRequirementDocumentId returns only that document's requirements, tenant-scoped", async () => {
      const repo = new RequirementRepository(appPool);
      const ctx = createTestRequestContext({ tenantId: "req-doc-scope-tenant" });
      const otherCtx = createTestRequestContext({ tenantId: "req-doc-scope-other-tenant" });

      await repo.save(ctx, {
        id: `req-${randomUUID()}`,
        requirementDocumentId: "doc-scoped",
        kind: "business",
        description: "In scope",
        status: "draft",
      });
      await repo.save(ctx, {
        id: `req-${randomUUID()}`,
        requirementDocumentId: "doc-other",
        kind: "business",
        description: "Different document",
        status: "draft",
      });
      await repo.save(otherCtx, {
        id: `req-${randomUUID()}`,
        requirementDocumentId: "doc-scoped",
        kind: "business",
        description: "Different tenant, same document id",
        status: "draft",
      });

      const found = await repo.findByRequirementDocumentId(ctx, "doc-scoped");
      expect(found).toHaveLength(1);
      expect(found[0]?.description).toBe("In scope");
    });
  },
);
