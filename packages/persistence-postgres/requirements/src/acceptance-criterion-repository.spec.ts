import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AcceptanceCriterion } from "@sap-app-factory/context-requirements";
import { createTestRequestContext, repositoryContractTests } from "@sap-app-factory/testing-kit";
import { AcceptanceCriterionRepository } from "./acceptance-criterion-repository.js";

const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "AcceptanceCriterionRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
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
      await adminPool.query('TRUNCATE TABLE "requirements"."acceptance_criteria"');
    });

    repositoryContractTests<AcceptanceCriterion, string>(
      () => new AcceptanceCriterionRepository(appPool),
      {
        makeId: () => `ac-${randomUUID()}`,
        buildAggregate: (id) => ({
          id,
          requirementId: "req-1",
          description: "System compares counted vs. system quantity per SKU.",
          origin: "extracted",
          status: "confirmed",
        }),
        mutateAggregate: (criterion) => ({ ...criterion, status: "confirmed" }),
        toComparable: (criterion) => criterion,
      },
    );

    it("findByRequirementId returns only that requirement's criteria, tenant-scoped", async () => {
      const repo = new AcceptanceCriterionRepository(appPool);
      const ctx = createTestRequestContext({ tenantId: "ac-req-scope-tenant" });

      await repo.save(ctx, {
        id: `ac-${randomUUID()}`,
        requirementId: "req-scoped",
        description: "in scope",
        origin: "extracted",
        status: "confirmed",
      });
      await repo.save(ctx, {
        id: `ac-${randomUUID()}`,
        requirementId: "req-other",
        description: "different requirement",
        origin: "extracted",
        status: "confirmed",
      });

      const found = await repo.findByRequirementId(ctx, "req-scoped");
      expect(found).toHaveLength(1);
      expect(found[0]?.description).toBe("in scope");
    });
  },
);
