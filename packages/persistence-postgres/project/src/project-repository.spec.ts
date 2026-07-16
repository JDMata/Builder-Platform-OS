import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe } from "vitest";
import type { Project } from "@sap-app-factory/context-project";
import { repositoryContractTests } from "@sap-app-factory/testing-kit";
import { ProjectRepository } from "./project-repository.js";

const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "ProjectRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let adminPool: Pool;
    let appPool: Pool;

    beforeAll(async () => {
      adminPool = new Pool({ connectionString: adminConnectionString });
      appPool = new Pool({ connectionString: appConnectionString });
      await migrate(drizzle(adminPool), {
        migrationsFolder: "./migrations",
        migrationsTable: "project_migrations",
      });
    });

    afterAll(async () => {
      await adminPool.end();
      await appPool.end();
    });

    beforeEach(async () => {
      await adminPool.query('TRUNCATE TABLE "project"."projects"');
    });

    repositoryContractTests<Project, string>(() => new ProjectRepository(appPool), {
      makeId: () => `proj-${randomUUID()}`,
      buildAggregate: (id) => ({
        id,
        workspaceId: "workspace-1",
        name: "Shift-End Stock Reconciliation",
        description: "Reconcile physical stock counts against SAP inventory at shift end.",
        sourceRequirementDocumentId: "doc-1",
      }),
      mutateAggregate: (project) => ({ ...project, description: "Updated description" }),
      toComparable: (project) => project,
    });
  },
);
