# UX Flow Diagram — Sprint 1

Represents the complete Sprint 1 experience, including the platform-internal transitions (workflow state, capability execution, events) behind each user-visible step — per the review's instruction to include decision points, alternative paths, AI interactions, workflow transitions, approvals, rework loops, artifact generation, capability execution, and platform events. Document uploads and Digital Twin updates are shown as explicitly out of scope for Sprint 1 (see [04](04-document-intelligence-review.md), [06](06-project-workspace-review.md)), not omitted silently.

```mermaid
flowchart TD
    Start([New user, empty account]) --> Login[Login screen]
    Login -->|OIDC redirect, ADR-0010| Discovery[Discovery Workspace:\nidea submission — SAF-42]

    Discovery -->|SubmitBusinessIdea — SAF-41| WFStart[WorkflowRun: pending → running\ncapture-idea step]
    WFStart --> CapReq[capability-request step:\nstructure-business-requirement]
    CapReq -->|CapabilityResolverPort resolves — SAF-45| Agent[requirements-analyst agent\ninvoked via LlmProviderPort — SAF-44]

    Agent --> Structured{Any Clarification\nraised?}

    Structured -- yes --> AwaitApproval1[WorkflowRun: awaiting_approval\nhuman-approval step: clarification]
    AwaitApproval1 --> ClarScreen[Clarification Q&A screen — SAF-47]
    ClarScreen -->|AnswerClarification — SAF-46| WFResume1[WorkflowRun: running]
    WFResume1 --> CapReq

    Structured -- no --> AwaitApproval2[WorkflowRun: awaiting_approval\nhuman-approval step: final review]
    AwaitApproval2 --> ReviewScreen[Project Charter / Review & Approve\nscreen — SAF-51]

    ReviewScreen -->|Request Changes| ClarScreen
    ReviewScreen -->|Approve & Create Project| Approve[ApproveRequirementDocument\nuse case — SAF-50]

    Approve --> Event1[[Event: requirements.document.captured.v1\nreal transactional outbox]]
    Approve --> ProjectCreate[Project aggregate created — SAF-48/49]
    ProjectCreate --> WFComplete[WorkflowRun: completed]
    WFComplete --> Event2[[Event: workflow.run.completed.v1]]

    WFComplete --> Ready[Project Ready screen]
    Ready --> End([Sprint 1 journey complete])

    %% Explicitly out of scope, shown for completeness per the review's own journey
    Discovery -.->|NOT Sprint 1| Upload[Upload Existing Documentation]
    Upload -.-> DocIntel[Document Intelligence:\nextraction / dedup / conflict detection]
    DocIntel -.-> CapReq

    Ready -.->|NOT Sprint 1| DigitalTwin[Digital Twin node/edge upserts]
    Ready -.->|NOT Sprint 1| FS[Functional Specification generation\nSprint 2]

    classDef sprint1 fill:none,stroke-width:2px;
    classDef future stroke-dasharray: 5 5;
    class Login,Discovery,WFStart,CapReq,Agent,Structured,AwaitApproval1,ClarScreen,WFResume1,AwaitApproval2,ReviewScreen,Approve,Event1,ProjectCreate,WFComplete,Event2,Ready sprint1;
    class Upload,DocIntel,DigitalTwin,FS future;
```

## Reading the diagram

- **Solid-path nodes** are Sprint 1's real scope, in implementation order.
- **Dashed-path nodes** (Upload/Document Intelligence, Digital Twin, Functional Specification) are shown only because the review's full journey asks for completeness — none is built, none is recommended for Sprint 1.
- **Decision points:** "Any Clarification raised?" (loops back to the clarification screen or proceeds to review) and "Request Changes vs. Approve" on the review screen (loops back to clarifications or completes the workflow).
- **Rework loop:** clarification → re-structuring → clarification, bounded by the agent's own project-scoped memory (never re-asking an already-answered question, per [03-discovery-workshop-review.md](03-discovery-workshop-review.md)).
- **Approval gates:** exactly two `awaiting_approval` states — one per clarification round (a lightweight, per-answer gate) and one final review gate before `Project` creation. Neither is skippable; SAF-50's rule blocks approval while any `Clarification` is outstanding.
- **Platform events:** `requirements.document.captured.v1` (first real emission, per [BASELINE.md](../../../BASELINE.md)'s previously-designed-but-unemitted event) and the existing `workflow.run.*` events, both through the real transactional outbox — no new event types invented for this flow.
- **Capability execution:** the only capability this flow invokes is `structure-business-requirement`, resolved through `CapabilityResolverPort`'s first real adapter (SAF-45) — confirmed exhaustively in [10-capability-model-review.md](10-capability-model-review.md).
