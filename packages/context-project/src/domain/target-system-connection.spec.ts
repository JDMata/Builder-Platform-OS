import { describe, expect, it } from "vitest";
import {
  createTargetSystemConnection,
  revokeTargetSystemConnection,
} from "./target-system-connection.js";

describe("TargetSystemConnection", () => {
  it("is created active, carrying only an encrypted reference", () => {
    const conn = createTargetSystemConnection({
      id: "c1",
      projectId: "p1",
      name: "Customer S/4HANA (prod)",
      encryptedConnectionRef: "enc:v1:opaque-ciphertext",
    });
    expect(conn.status).toBe("active");
    expect(conn.encryptedConnectionRef).toContain("enc:");
  });

  it("rejects an empty encrypted reference", () => {
    expect(() =>
      createTargetSystemConnection({
        id: "c1",
        projectId: "p1",
        name: "x",
        encryptedConnectionRef: "",
      }),
    ).toThrow(/must not be empty/);
  });

  it("revokes without mutating the original", () => {
    const conn = createTargetSystemConnection({
      id: "c1",
      projectId: "p1",
      name: "x",
      encryptedConnectionRef: "enc:v1:opaque",
    });
    const revoked = revokeTargetSystemConnection(conn);
    expect(revoked.status).toBe("revoked");
    expect(conn.status).toBe("active");
  });
});
