import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe } from "vitest";
import type { RequirementDocument } from "@sap-app-factory/context-requirements";
import { repositoryContractTests } from "@sap-app-factory/testing-kit";
import { RequirementDocumentRepository } from "./requirement-document-repository.js";

/** Real Postgres integration tests, gated behind SAF_TEST_POSTGRES_URL — same convention as every other persistence-postgres/* package. */
const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "RequirementDocumentRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
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
      await adminPool.query('TRUNCATE TABLE "requirements"."requirement_documents"');
    });

    repositoryContractTests<RequirementDocument, string>(
      () => new RequirementDocumentRepository(appPool),
      {
        makeId: () => `doc-${randomUUID()}`,
        buildAggregate: (id) => ({
          id,
          workspaceId: "workspace-1",
          ideaText: "We need a way to reconcile stock counts",
          suggestedProjectName: "",
          status: "draft",
        }),
        mutateAggregate: (document) => ({
          ...document,
          suggestedProjectName: "Shift-End Stock Reconciliation",
          status: "approved",
        }),
        toComparable: (document) => document,
      },
    );
  },
);
