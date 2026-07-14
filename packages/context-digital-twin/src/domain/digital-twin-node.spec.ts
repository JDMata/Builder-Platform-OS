import { describe, expect, it } from "vitest";
import { createDigitalTwinNode, retireDigitalTwinNode } from "./digital-twin-node.js";

describe("DigitalTwinNode", () => {
  it("is created active, referencing its source by id — never duplicating it", () => {
    const node = createDigitalTwinNode({
      id: "n1",
      projectId: "p1",
      nodeType: "requirement",
      sourceRef: { context: "requirements", aggregateId: "req-1", version: "3" },
      label: "The system shall do a thing",
    });
    expect(node.status).toBe("active");
    expect(node.sourceRef.aggregateId).toBe("req-1");
  });

  it("rejects an empty label", () => {
    expect(() =>
      createDigitalTwinNode({
        id: "n1",
        projectId: "p1",
        nodeType: "requirement",
        sourceRef: { context: "requirements", aggregateId: "req-1", version: "1" },
        label: "",
      }),
    ).toThrow(/must not be empty/);
  });

  it("retires without mutating the original — never hard-deleted", () => {
    const node = createDigitalTwinNode({
      id: "n1",
      projectId: "p1",
      nodeType: "requirement",
      sourceRef: { context: "requirements", aggregateId: "req-1", version: "1" },
      label: "x",
    });
    const retired = retireDigitalTwinNode(node);
    expect(retired.status).toBe("retired");
    expect(node.status).toBe("active");
  });
});
