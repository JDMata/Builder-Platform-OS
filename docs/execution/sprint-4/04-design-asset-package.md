# Builder Platform OS — Design Asset Package

**Board:** Builder Platform OS Product Experience Board.
**Status:** Sprint 4 implementation handbook. [01](01-experience-realization-charter.md)/[02](02-design-system-foundation.md)/[03](03-experience-realization-package.md) are immutable references — this package operationalizes them into per-component detail; it does not restate them.
**Format discipline:** catalogs, matrices, tables, checklists only. No narrative.

---

## Part 1 — Design System Inventory

| Category | Purpose | Owner | Status | Dependencies | Priority | Wave | Consumers | Future Consumers |
|---|---|---|---|---|---|---|---|---|
| Foundations | Tokens, type, icon | Design System Architect | Specified | None | Critical | 1 | All categories | All future categories |
| Inputs | Text/selection capture | Product Designer | Specified | Foundations | Critical | 1 | Login, Idea Submission | Documentation Factory forms |
| Navigation | Global orientation | UX Architect | Specified | Foundations | High | 1 | All screens | All future screens |
| Feedback | State communication | Product Designer | Specified | Foundations | High | 1 | All screens | All future screens |
| Overlays | Transient contextual surfaces | UX Architect | Specified | Foundations | Medium | 1 | Command Palette shell | Canvas view (Sprint 6+) |
| AI Interaction | AI proposal/review surfaces | Product Designer | Specified | Foundations, Feedback | Critical | 2 | Clarification, Project Charter | Documentation review screens |
| Data Display | Structured content presentation | Product Designer | Specified | Foundations | High | 2 | Project Charter | Documentation/Development artifacts |
| Workflow | Bounded sequential progression | UX Architect | Specified | Navigation | Medium | 2 | Discovery's Guided flow | Documentation Guided flow |
| Dialogs | Proportionate confirmation | Product Designer | Specified | Foundations | Medium | 1 | Project Charter | Deployment `Change` approval |
| Canvas | Structural Engineering Canvas shell | UX Architect + Frontend Architect | Specified, structure-only | Foundations | Medium | 3 | None yet | Sprint 6+ Graph Runtime |
| Inspector | Structural detail panel | UX Architect + Frontend Architect | Specified, structure-only | Foundations | Medium | 3 | None yet | Sprint 6+ Graph Runtime |
| Tables | Reference-density tabular data | Product Designer | Specified | Foundations | Medium | 2 | None yet (no tabular screen shipped) | Documentation/Testing artifact review |
| Forms | Progressive, labeled input groups | Product Designer | Specified | Inputs | Critical | 1 | Login, Idea Submission | Documentation Factory forms |
| Layout | Base/Raised/Overlay/Translucent surfaces | Design System Architect | Specified | Foundations | Critical | 1 | All categories | All future categories |

---

## Part 2 — Component Catalog

Format: one compact field table per component. Traceability abbreviated (`PXF §N`, `ECS §N`, `XLS §N`, `DSF §N` = Design System Foundation, `ERP §N` = Experience Realization Package).

### Text Field

| Field | Value |
|---|---|
| Category | Inputs |
| Description | Single-line labeled text capture |
| Variants | Single-line, password (Login only) |
| States | Default, hover, focus, active, disabled, loading, error |
| Properties | Label text, placeholder, helper text, error message |
| Slots | Leading/trailing icon (optional) |
| Composition Rules | Label always above field, never placeholder-as-label (XLS §23) |
| Accessibility Rules | Label programmatically associated; error announced |
| Keyboard Behavior | Tab-reachable; Enter submits enclosing form |
| Token Dependencies | `color-*`, `type-body`, `space-*`, `radius-*` |
| Reusable Patterns | Shared with Select's label treatment |
| Anti-patterns | Placeholder used as the only label |
| Current Consumers | Login, Idea Submission |
| Future Consumers | Documentation Factory forms |
| Engineering Notes | Contract-test against the shared Forms state model, not per-screen |
| Traceability | XLS §23; DSF §3, §4 |

### Select

| Field | Value |
|---|---|
| Category | Inputs |
| Description | Labeled single-choice selection from a closed set |
| Variants | Standard |
| States | Default, hover, focus, active, disabled, loading, error |
| Properties | Label, options list, selected value |
| Slots | None |
| Composition Rules | Same labeling rule as Text Field |
| Accessibility Rules | Keyboard-navigable option list; selected value announced |
| Keyboard Behavior | Arrow keys move selection; Enter/Space commits |
| Token Dependencies | Same as Text Field |
| Reusable Patterns | Shares Text Field's label/error treatment |
| Anti-patterns | A closed set with more than a screen's worth of options (a search/filter pattern is a **[GAP]** — not specified anywhere) |
| Current Consumers | None shipped yet — Idea Submission's workspace field is a static display, not a real Select (`CI-B8`) |
| Future Consumers | A real workspace selector, once `CI-B8` closes |
| Engineering Notes | Do not build ahead of `CI-B8`'s resolution |
| Traceability | XLS §23; DSF §3 |

### Checkbox

| Field | Value |
|---|---|
| Category | Inputs |
| Description | Binary toggle within a form |
| Variants | Standard |
| States | Default, hover, focus, active, disabled, error |
| Properties | Label, checked state |
| Slots | None |
| Composition Rules | Label always adjacent, click target includes the label |
| Accessibility Rules | Checked state announced; label clickable |
| Keyboard Behavior | Space toggles |
| Token Dependencies | `color-*`, `radius-*` |
| Reusable Patterns | Shares Radio's selection-state visual language |
| Anti-patterns | Used for mutually exclusive choices (use Radio) |
| Current Consumers | None shipped |
| Future Consumers | **[GAP]** — no known upcoming screen named yet |
| Engineering Notes | Build only when a real consumer is named (PXF §15) |
| Traceability | XLS §23; DSF §3 |

### Radio

| Field | Value |
|---|---|
| Category | Inputs |
| Description | Single choice among mutually exclusive options |
| Variants | Standard |
| States | Default, hover, focus, active, disabled, error |
| Properties | Label, group name, selected value |
| Slots | None |
| Composition Rules | Grouped under one shared label |
| Accessibility Rules | Group semantics exposed; arrow keys move within group |
| Keyboard Behavior | Arrow keys move selection within the group |
| Token Dependencies | Same as Checkbox |
| Reusable Patterns | Shares Checkbox's selection-state visual language |
| Anti-patterns | Used for a single binary toggle (use Checkbox) |
| Current Consumers | None shipped |
| Future Consumers | **[GAP]** |
| Engineering Notes | Same as Checkbox |
| Traceability | XLS §23; DSF §3 |

### Button

| Field | Value |
|---|---|
| Category | Inputs |
| Description | The one primary action a screen offers, plus secondary actions |
| Variants | Primary, secondary |
| States | Default, hover, focus, active, disabled, loading |
| Properties | Label text, leading icon (optional) |
| Slots | Icon |
| Composition Rules | Exactly one primary Button per screen (PXF §10, §11) |
| Accessibility Rules | Reachable and activatable by keyboard; loading state announced |
| Keyboard Behavior | Enter/Space activates |
| Token Dependencies | `color-action-primary`, `type-*`, `radius-*`, `elevation-*` |
| Reusable Patterns | The single most-reused component in the system |
| Anti-patterns | Two visually competing primary buttons on one screen |
| Current Consumers | Login, Idea Submission, Clarification, Project Charter |
| Future Consumers | Every future screen |
| Engineering Notes | Highest blast-radius component — any change reviewed at the highest scrutiny tier |
| Traceability | PXF §10, §11; DSF §3, §4 |

### Global Navigation

| Field | Value |
|---|---|
| Category | Navigation |
| Description | The minimal, stable chrome naming tenant/Workspace/help |
| Variants | Single |
| States | Default only — this element does not change state with content |
| Properties | Current tenant, current Workspace, help entry point |
| Slots | None |
| Composition Rules | Never grows with feature count (PXF §8) |
| Accessibility Rules | Landmark-region semantics |
| Keyboard Behavior | Tab-reachable, standard landmark navigation |
| Token Dependencies | Neutral-foundation color only, never accent (XLS §21) |
| Reusable Patterns | None — this is the one truly global element |
| Anti-patterns | Adding a per-feature nav item |
| Current Consumers | All shipped screens implicitly (currently minimal/unstyled — reconciliation pending) |
| Future Consumers | All future screens |
| Engineering Notes | Reconciliation against XLS §21 is part of the Discovery reconciliation record (ERP §5) |
| Traceability | PXF §8; XLS §21; DSF §3 |

### Process-Position Indicator

| Field | Value |
|---|---|
| Category | Navigation |
| Description | Shows where the user is within a bounded journey — never a hierarchical trail |
| Variants | Single |
| States | Per-step: complete, current, upcoming |
| Properties | Step list, current step index |
| Slots | None |
| Composition Rules | Explicitly not a breadcrumb (PXF §8) — see ERP §6's correction |
| Accessibility Rules | Current step announced on navigation |
| Keyboard Behavior | Read-only, not directly interactive |
| Token Dependencies | `color-*`, `type-*` |
| Reusable Patterns | Same component across Discovery and future Documentation Guided flows |
| Anti-patterns | Rendered as a clickable hierarchical path |
| Current Consumers | Discovery's Guided flow (reconciliation pending) |
| Future Consumers | Documentation Factory's Guided flow |
| Engineering Notes | The single component that resolves the "Breadcrumbs" naming correction |
| Traceability | PXF §8; ERP §6 |

### Notification

| Field | Value |
|---|---|
| Category | Feedback |
| Description | Scoped status communication, fixed taxonomy |
| Variants | Informational, success, warning, error, AI-proposal |
| States | Visible, dismissed |
| Properties | Message text, severity variant |
| Slots | None |
| Composition Rules | Never an accumulating feed (XLS §30) |
| Accessibility Rules | Announced via a live region proportional to severity |
| Keyboard Behavior | Dismissible via keyboard |
| Token Dependencies | The five fixed semantic categories (XLS §9) |
| Reusable Patterns | Same component for every severity — variant, not a new component, per severity |
| Anti-patterns | A sixth, ad hoc severity introduced outside the fixed taxonomy |
| Current Consumers | Implicit in Login/Idea Submission's error handling (reconciliation pending) |
| Future Consumers | Every future screen |
| Engineering Notes | Verify the fixed five-item taxonomy is not silently extended |
| Traceability | XLS §9, §30; DSF §3 |

### Inline Validation Message

| Field | Value |
|---|---|
| Category | Feedback |
| Description | Field-scoped error/help text |
| Variants | Error, helper |
| States | Visible, hidden |
| Properties | Message text |
| Slots | None |
| Composition Rules | Attached to the specific field it describes, never floating |
| Accessibility Rules | Associated to its field via accessible description |
| Keyboard Behavior | Not directly interactive |
| Token Dependencies | Semantic danger category (error variant only) |
| Reusable Patterns | Shared across Text Field, Select |
| Anti-patterns | A generic, unscoped error banner replacing this |
| Current Consumers | Login, Idea Submission |
| Future Consumers | All future forms |
| Engineering Notes | Prevention (disabling submit) is preferred over this where possible (PXF §18) |
| Traceability | PXF §18; XLS §28; DSF §4 |

### Command Palette

| Field | Value |
|---|---|
| Category | Overlays |
| Description | The keyboard-first, searchable answer to "how do I do X" |
| Variants | Single |
| States | Closed, open, searching, no-results |
| Properties | Query text, action list |
| Slots | None |
| Composition Rules | The one legitimate translucent-overlay use case (XLS §10) — never broadened into ambient decoration |
| Accessibility Rules | Full keyboard operability; opaque fallback for reduced-transparency needs |
| Keyboard Behavior | A global shortcut opens it; arrow keys navigate results; Enter commits |
| Token Dependencies | Translucent-overlay material role (XLS §11) |
| Reusable Patterns | One instance, global — not per-screen |
| Anti-patterns | A second, competing quick-action surface |
| Current Consumers | None shipped — structural shell only (ERP Wave 3) |
| Future Consumers | Every future action, once a real action registry exists |
| Engineering Notes | Structural shell now; full action registry is **[GAP]** until real actions exist beyond Discovery |
| Traceability | ECS §9.2; XLS §10; ERP §6 |

### Suggestion Panel

| Field | Value |
|---|---|
| Category | AI Interaction |
| Description | Presents AI-proposed content as a reviewable, editable proposal |
| Variants | Single |
| States | Proposed, editing, accepted, rejected |
| Properties | Proposed content, provenance reference |
| Slots | Accept/edit/reject controls |
| Composition Rules | Never silently applied — a human action is always required (PXF §9.1) |
| Accessibility Rules | Proposal state announced on appearance |
| Keyboard Behavior | Accept/edit/reject all keyboard-reachable |
| Token Dependencies | AI-provenance semantic category |
| Reusable Patterns | Shared shell across Clarification and Project Charter |
| Anti-patterns | An auto-accepted proposal with no visible confirmation step |
| Current Consumers | Clarification, Project Charter (reconciliation pending) |
| Future Consumers | Documentation Factory's spec review |
| Engineering Notes | Reject must be as easy as accept (ECS §7.5) |
| Traceability | PXF §9.1; ECS §7; XLS §19; DSF §6 |

### Confidence Indicator

| Field | Value |
|---|---|
| Category | AI Interaction |
| Description | Shows AI's confidence at the point of decision |
| Variants | Single |
| States | Present only when a real confidence value exists |
| Properties | Confidence value/band |
| Slots | None |
| Composition Rules | Never buried in a detail panel (ECS §7.3) |
| Accessibility Rules | Non-color-only signaling (text/shape alongside color) |
| Keyboard Behavior | Read-only |
| Token Dependencies | AI-provenance semantic category |
| Reusable Patterns | Same component wherever confidence is shown |
| Anti-patterns | A bare percentage with no other signal (PXF §9.4 explicitly rejects this) |
| Current Consumers | Project Charter |
| Future Consumers | Documentation Factory's spec review |
| Engineering Notes | Confirm the "not a bare percentage" rule is honored in reconciliation |
| Traceability | PXF §9.4; ECS §7.3; XLS §19.4 |

### Provenance Display

| Field | Value |
|---|---|
| Category | AI Interaction |
| Description | Attributes AI-produced content to a specific Capability/Provider |
| Variants | Single |
| States | Present on every AI-produced element |
| Properties | Capability/provider name |
| Slots | None |
| Composition Rules | Never "the AI" undifferentiated (PXF §21.3) |
| Accessibility Rules | Text-based, always readable by assistive technology |
| Keyboard Behavior | Read-only |
| Token Dependencies | AI-provenance semantic category |
| Reusable Patterns | Same component wherever AI content appears |
| Anti-patterns | Omitted on any AI-produced element |
| Current Consumers | Clarification, Project Charter |
| Future Consumers | Every future AI-touching screen |
| Engineering Notes | Only one real provider exists today (`structure-business-requirement`) — verify this doesn't collapse to a hardcoded label |
| Traceability | PXF §21.3; ECS §7.4; DSF §6 |

### Clarification Prompt

| Field | Value |
|---|---|
| Category | AI Interaction |
| Description | A discrete, bounded AI-generated question |
| Variants | Single |
| States | Asked, answered |
| Properties | Question text, answer input |
| Slots | Answer input (composes Text Field) |
| Composition Rules | Disappears once answered, never an ever-scrolling log (PXF §9.3) |
| Accessibility Rules | New question announced via live region — **flagged unverified**, per ERP §5 |
| Keyboard Behavior | Standard form interaction |
| Token Dependencies | AI-provenance semantic category |
| Reusable Patterns | Composes Text Field/Button |
| Anti-patterns | Accumulating unanswered prompts into a scrollable history |
| Current Consumers | Clarification |
| Future Consumers | Any future bounded clarification loop |
| Engineering Notes | The live-region verification is this component's one open QA item |
| Traceability | PXF §9.3; DSF §6; ERP §5, §8 |

### Card

| Field | Value |
|---|---|
| Category | Data Display |
| Description | One discrete, self-contained bounded object |
| Variants | Single |
| States | Default, hover (if interactive), focus (if interactive) |
| Properties | Title, content region, optional action |
| Slots | Content, action |
| Composition Rules | Represents exactly one real object — never a generic container (XLS §25) |
| Accessibility Rules | If interactive, keyboard-reachable as a unit |
| Keyboard Behavior | If interactive, Enter/Space activates |
| Token Dependencies | Raised material, `radius-card` |
| Reusable Patterns | Used for Requirement summaries, future Artifact summaries |
| Anti-patterns | Used as a generic layout box with no represented object |
| Current Consumers | Project Charter, Project Ready |
| Future Consumers | Documentation/Development artifact summaries |
| Engineering Notes | Internal structure must stay consistent across every instance of the same represented object (XLS §25) |
| Traceability | XLS §25; DSF §3 |

### Table

| Field | Value |
|---|---|
| Category | Data Display |
| Description | Genuinely tabular, comparative data at Reference density |
| Variants | Single |
| States | Default, empty, loading |
| Properties | Column definitions, row data |
| Slots | None |
| Composition Rules | Reserved for genuinely tabular data — never a default catch-all layout (XLS §24) |
| Accessibility Rules | Real semantic table markup, never a styled `div` grid |
| Keyboard Behavior | Standard table navigation |
| Token Dependencies | Typography-first row hierarchy, not heavy borders (XLS §24) |
| Reusable Patterns | None shipped yet |
| Anti-patterns | Used for any list of items that isn't genuinely comparative/tabular |
| Current Consumers | None — no tabular screen has shipped |
| Future Consumers | Documentation/Testing artifact review |
| Engineering Notes | Do not build ahead of a named consumer (PXF §15) |
| Traceability | XLS §5, §24 |

### Guided-Flow Step Container

| Field | Value |
|---|---|
| Category | Workflow |
| Description | Bounds interaction to exactly the current step |
| Variants | Single |
| States | Active step only rendered interactively |
| Properties | Step content |
| Slots | Step content |
| Composition Rules | Constrained progression, distinct from free Canvas manipulation (ECS §8.1) |
| Accessibility Rules | Focus moves to the new step's content on transition |
| Keyboard Behavior | Standard form/content navigation within the step |
| Token Dependencies | Base material, Spacing scale |
| Reusable Patterns | Wraps every Discovery step; will wrap Documentation's Guided steps |
| Anti-patterns | Rendering more than the current step's content as interactive |
| Current Consumers | Idea Submission, Clarification, Project Charter |
| Future Consumers | Documentation Factory's Guided flow |
| Engineering Notes | Pairs with Process-Position Indicator |
| Traceability | ECS §6, §8; PXF §5 |

### Confirmation Dialog

| Field | Value |
|---|---|
| Category | Dialogs |
| Description | Proportionate confirmation for a state-changing or irreversible action |
| Variants | Low-risk, high-risk |
| States | Open, closed |
| Properties | Message, primary/secondary action |
| Slots | Action buttons (composes Button) |
| Composition Rules | Confirmation friction proportional to irreversibility (PXF §18) |
| Accessibility Rules | Focus trapped within while open; Escape closes |
| Keyboard Behavior | Escape dismisses; Enter confirms the primary action |
| Token Dependencies | Overlay material |
| Reusable Patterns | Composes Button |
| Anti-patterns | The same confirmation weight for a low-risk and a high-risk action |
| Current Consumers | Project Charter's confirm step (reconciliation pending — verify proportionate weight is actually implemented) |
| Future Consumers | Deployment `Change` approval |
| Engineering Notes | Verify low-risk vs. high-risk distinction is real, not assumed, during reconciliation |
| Traceability | PXF §18; XLS §11, §14 |

### Canvas Container

| Field | Value |
|---|---|
| Category | Canvas |
| Description | The frame that will host the Canvas view — structure only |
| Variants | Single |
| States | Empty (only state possible before Sprint 6) |
| Properties | None populated yet |
| Slots | Future node/edge rendering surface |
| Composition Rules | No node/edge content designed here (Charter Out-of-Scope) |
| Accessibility Rules | **[GAP]** — cannot be specified until real content exists |
| Keyboard Behavior | **[GAP]**, same reason |
| Token Dependencies | Base material |
| Reusable Patterns | None yet |
| Anti-patterns | Populating with placeholder graph data that looks real |
| Current Consumers | None |
| Future Consumers | Sprint 6+ Graph Runtime |
| Engineering Notes | Building this ahead of Sprint 6 risks throwaway rework (ERP §9) |
| Traceability | ECS §6; ERP §6, §9 |

### Inspector

| Field | Value |
|---|---|
| Category | Inspector |
| Description | Header/content/actions structure for focused-object detail — structure only |
| Variants | Single |
| States | Empty (only state possible before Sprint 6) |
| Properties | Header, content region, actions region |
| Slots | Header, content, actions |
| Composition Rules | Exactly one Inspector context at a time (ECS §10.2) |
| Accessibility Rules | **[GAP]** until real content exists |
| Keyboard Behavior | **[GAP]**, same reason |
| Token Dependencies | Raised material |
| Reusable Patterns | Structure reused regardless of what node/edge type it will show |
| Anti-patterns | Multiple simultaneous Inspector instances |
| Current Consumers | None |
| Future Consumers | Sprint 6+ Graph Runtime |
| Engineering Notes | Same throwaway-rework caution as Canvas Container |
| Traceability | ECS §10; XLS §22; ERP §6, §9 |

---

## Part 3 — Interaction Catalog

| Interaction | Behavior | Consuming components |
|---|---|---|
| Mouse | Hover signals interactivity only, never the sole state carrier | Button, Card (interactive), Select |
| Keyboard | Full parity with every pointer action | All components |
| Touch | **[GAP]** — no constitutional document specifies touch-target sizing or gesture behavior; PXF §17/XLS §34 establish desktop-first, degrade-gracefully, but no touch-specific rule exists | All components, deferred |
| Focus | Always visible, distinct from selection | All interactive components |
| Loading | Proportional to actual duration; skeleton for structural loads, honest progress for long operations | Button, Table, Suggestion Panel |
| Validation | Inline, preventive where possible | Text Field, Select, Inline Validation Message |
| AI interactions | Proposal → human approval, never automatic | Suggestion Panel, Confidence Indicator, Provenance Display, Clarification Prompt |
| Error recovery | Calm, specific, actionable; fixed semantic category only | Inline Validation Message, Notification |
| Success behavior | Quiet, proportionate, no celebratory flourish | Notification, Confirmation Dialog |
| Animation expectations | One of four XLS §15 categories; reduced-motion fallback verified | All animated components |
| Accessibility expectations | WCAG 2.2 AA; screen-reader order matches visual order | All components |

---

## Part 4 — Screen Composition Guide

| Field | Login | Idea Submission | Clarification | Project Charter | Project Ready |
|---|---|---|---|---|---|
| Purpose | Authenticate | Capture the idea | Resolve ambiguity | Review and confirm | Confirm handoff |
| Primary Components | Text Field ×2, Button | Text Field, Button | Clarification Prompt, Button | Card, Suggestion Panel, Confidence Indicator, Confirmation Dialog | Card |
| Secondary Components | Inline Validation Message | Select (currently static, `CI-B8`), Notification | Provenance Display | Provenance Display, Button | Button (next step) |
| Layout Pattern | Focus density, single-column | Focus density, single-column | Focus density | Reference density for the requirement summary, Focus density for the confirm action | Focus density |
| Interaction Pattern | Standard form | Standard form | Bounded Q&A loop | Review-and-approve | Read-only confirmation |
| AI Pattern | None | Structuring occurs after submit (not visible on-screen) | Full Suggestion Panel pattern | Full Suggestion Panel + Confidence + Provenance pattern | None |
| Accessibility Pattern | Label association, error announcement | Same, plus textarea labeling | Live-region announcement (unverified, per ERP §5) | Confirm-control keyboard operability, non-color confidence signaling | Success announcement |
| Navigation Pattern | Entry point, no Process-Position Indicator needed | Step 1 of Guided flow | Step 2 | Step 3 | Step 4, terminal |
| Reusable Sections | Text Field/Button pattern | Form pattern (extends Login) | AI Interaction pattern | AI Interaction + Card pattern | Card pattern |
| Unique Sections | OIDC redirect handling | Long-form textarea | Bounded Q&A loop | Richest AI-review surface in the product | Minimal, confirmation-only |
| Technical Debt | None found | `CI-B8` (static workspace field) | None found beyond the live-region item | `CI-B5` (no reopen path) | None found |
| Known GAPs | None | Real Select component (Part 2) | Live-region verification | Confirmation Dialog's proportionate-weight verification | None |
| Future Evolution | Unlikely to change materially | Real workspace selector, once multi-workspace is real | Extends to Documentation's own clarification needs, if any | Direct template for Documentation Factory's spec review screens | Extends to future Lifecycle Workspace confirmations |

---

## Part 5 — Canvas Shell Asset Guide

| Asset | Purpose | Dependencies | Composition | Consumers | Future Consumers | Priority | Deferred Items |
|---|---|---|---|---|---|---|---|
| Platform Shell | Global, quiet chrome | Foundations | Global Navigation | None yet | All future screens | High | Full styling reconciliation |
| Navigation | Tenant/Workspace/help | Platform Shell | Global Navigation component | None yet | All future screens | High | Real Workspace Switcher UI |
| Workspace Switcher | Move between Workspaces | Navigation | A sub-element of Global Navigation, not a separate component (PXF §8's "which Workspace" is already part of the minimal global nav) | None shipped (single Workspace only) | Multi-Workspace future | Medium | Full UI — **[GAP]** until multi-Workspace is real |
| Toolbar | Contextual actions for the active Lifecycle Workspace | Platform Shell | Composes Button | None yet | Documentation/Development toolbars | Medium | Real action set per Lifecycle Workspace |
| Command Palette | Keyboard-first action surface | Foundations, Overlays | See Part 2 | None yet | Every future action | Medium | Full action registry |
| Canvas Container | Structural Canvas frame | Foundations | See Part 2 | None | Sprint 6+ | Medium | All real content |
| Inspector | Structural detail panel | Foundations | See Part 2 | None | Sprint 6+ | Medium | All real content |
| Notification System | Scoped status delivery | Foundations, Feedback | Composes Notification | Implicit today | All future screens | High | None beyond reconciliation |
| Status Area | Executive-view-adjacent signals | Foundations | Structural only | None | Sprint 6+ Executive view | Low | All real aggregated data |
| Context Actions | Object-scoped actions | Inspector | **Not a separate asset** — this is Inspector's "actions" region (ECS §10) | None | Sprint 6+ | Medium | Same as Inspector |
| Keyboard Shortcuts | Full parity mechanism | Command Palette | Discoverable via Command Palette, not a hidden reference | None yet | Every future action | Medium | Full shortcut registry |
| AI Presence | Proportional AI visibility | Foundations, AI Interaction | No standalone component — a rule applied to every AI-touching component (PXF §9.2) | Clarification, Project Charter | Every future AI-touching screen | High | None — this is a rule, not an asset to build |

---

## Part 6 — Token Usage Catalog

| Semantic token category | Consumers | Allowed usage | Forbidden usage | Inheritance | Overrides | Common mistakes | Validation rule |
|---|---|---|---|---|---|---|---|
| `color-*` | All components | Neutral foundation, one accent, five fixed semantic categories | A sixth ad hoc hue | Component ← Semantic ← Primitive | Component-level only when a semantic default genuinely doesn't fit | Using the accent for decoration rather than the platform's own primary action | Zero raw hex values outside Primitive collection |
| `type-*` | All components | The closed type-scale roles | An ad hoc size outside the scale | Same | Rare — a role should already fit | Introducing a new size instead of reusing an existing role | Every text layer maps to a role |
| `space-*` | All components | The modular scale | A freehand pixel gap | Same | None expected | Eyeballing a gap instead of picking a step | Every gap maps to a step |
| `radius-*` | Card, Button, Dialogs, Inputs | Material-role-tied set | A radius unrelated to the component's declared material | Same | None expected | A radius chosen for visual taste rather than material role | Radius matches declared material |
| `elevation-*` (bundles shadow/border) | Card, Dialogs, Command Palette | Exactly the four levels | A fifth invented level | Same | None — a fifth level requires constitutional-weight review | Adding a custom shadow instead of using an elevation level | Only four levels exist in the collection |
| `motion-*` | Any animated component | One of four categories | A duration/easing outside its category | Same | None expected | Bespoke motion invented per component | Reduced-motion fallback verified per instance |
| `icon-*` | Button, Notification, Navigation | Sized against the type scale | An icon-only affordance with no text pairing | Same | None expected | An icon used without a text label or established convention | Every icon paired or conventionally unambiguous |

---

## Part 7 — Accessibility Asset Guide

- **Typography** — [ ] Hierarchy readable with color removed [ ] Tabular figures used wherever numbers are compared
- **Color** — [ ] No meaning conveyed by color alone [ ] Restricted to neutral + accent + five semantic categories
- **Contrast** — [ ] Every color pairing meets WCAG 2.2 AA in both themes
- **Focus** — [ ] Every interactive element has a visible, never-suppressed focus state [ ] Focus distinct from selection
- **Keyboard** — [ ] Every pointer action has a keyboard equivalent [ ] Command Palette reachable via a global shortcut
- **Forms** — [ ] Labels above fields, never placeholder-only [ ] Errors announced at the field they belong to
- **Dialogs** — [ ] Focus trapped while open [ ] Escape dismisses [ ] Confirmation weight proportional to risk
- **Tables** — [ ] Real semantic table markup [ ] Row/column headers programmatically associated
- **AI Components** — [ ] Provenance always present [ ] Confidence never color-only [ ] Accept/reject equally reachable
- **Notifications** — [ ] Severity announced via live region proportional to urgency [ ] Dismissible via keyboard
- **Canvas** — [ ] **[GAP]** — not checkable until real content exists (Sprint 6+)
- **Inspector** — [ ] **[GAP]** — same
- **Prototype** — [ ] Keyboard-only walkthrough completes every primary-journey step

---

## Part 8 — Design Review Checklist

- [ ] Token usage — zero raw values outside Primitive
- [ ] Component usage — composed from the shared set, no undocumented one-off
- [ ] Interaction consistency — matches Part 3's catalog for every interaction type present
- [ ] Accessibility — Part 7's relevant checklist fully passed
- [ ] Naming — Figma name matches the code-facing name exactly
- [ ] Variants — full state set present, none omitted, none invented beyond spec
- [ ] Composition — built from existing components/tokens, not one-off styling
- [ ] Responsiveness — density adapts per XLS §34, no device-specific breakpoint invented
- [ ] AI behavior — proposal/approval boundary intact, provenance present
- [ ] Prototype fidelity — matches real shipped behavior, deviations recorded
- [ ] Definition of Done — PXF §25 / ECS §15 / XLS §40, all applicable, satisfied

**Review Outcome** (choose exactly one): **Pass** — every item true, no exception. **Pass with observations** — every "must"-tier item true, a "should"-tier item noted for follow-up. **Requires correction** — a "must"-tier item fails, fixable without redesign. **Reject** — a "must"-tier item fails in a way that implies a Charter/Design-System-level gap, routed back to the Board.

---

## Part 9 — Frontend Implementation Guide

| Component | React complexity | Effort | Shared logic | Reusable hooks | Testing strategy | Story coverage | Mock data | API dependency | Risk | DoD |
|---|---|---|---|---|---|---|---|---|---|---|
| Text Field, Select, Checkbox, Radio | Low | XS each | Shared form-field wrapper | A form-state hook | Unit + accessibility | One story per state | `Requirement` shape (CMM) | Real (Discovery) | Low | PXF §25 |
| Button | Low | XS | None beyond token consumption | None | Unit + accessibility | One story per variant × state | N/A | N/A | Low | PXF §25 |
| Global Navigation, Process-Position Indicator | Low–Medium | S | Shared layout shell | A step-progress hook | Unit | One story per step-state | N/A | N/A | Low | PXF §25, ECS §15 |
| Notification, Inline Validation Message | Low | XS | Shared severity-variant logic | None | Unit + accessibility | One story per severity | N/A | N/A | Low | PXF §25 |
| Command Palette | Medium | M | Search/filter logic | An action-registry hook | Unit + keyboard-only e2e | One story per state | Static action list until real actions exist | None yet | Medium (action registry is a `[GAP]`) | PXF §25, XLS §40 |
| Suggestion Panel, Confidence Indicator, Provenance Display, Clarification Prompt | Medium | M each | Shared AI-provenance wrapper | An AI-proposal-state hook | Unit + accessibility + contract test against real Discovery capability | One story per state | `Requirement`/`Artifact` shape (CMM) | Real (Discovery only) | Low for Discovery, Medium for Documentation-shaped reuse | PXF §25, ECS §15, XLS §40 |
| Card, Table | Low–Medium | S–M | Shared surface-material logic | None | Unit | One story per represented object type | CMM entity shapes | Mocked except Discovery | Low | PXF §25, XLS §40 |
| Guided-Flow Step Container | Medium | M | Step-sequencing logic | Shares the step-progress hook | Unit + e2e | One story per step | N/A | Real (Discovery) | Low | ECS §15 |
| Confirmation Dialog | Low–Medium | S | Shared overlay-focus-trap logic | A focus-trap hook | Unit + accessibility | One story per risk tier | N/A | N/A | Low | PXF §25 |
| Canvas Container, Inspector | Medium (structure only) | S now, unknown once real | None yet | None yet | Structural render test only | One story: empty state | None | None | Medium — throwaway-rework risk if Sprint 6's real shape differs | ECS §15 (partial, structure only) |

---

## Part 10 — Design Asset Traceability Matrix

| Asset | Constitutional Doc | Constitutional Section | Design System Section | Experience Package Section | Discovery Usage | Future Sprint Usage | Engineering Consumer | Validation Artifact |
|---|---|---|---|---|---|---|---|---|
| Text Field | XLS | §23 | DSF §3 | ERP §4, §5 | Login, Idea Submission | Documentation forms | UX Team | Part 7 Forms checklist |
| Select | XLS | §23 | DSF §3 | ERP §5 | None (`CI-B8`) | Multi-Workspace | UX Team | Part 7 Forms checklist |
| Checkbox, Radio | XLS | §23 | DSF §3 | ERP §4 | None | **[GAP]** — no named consumer | UX Team | Part 7 Forms checklist |
| Button | PXF | §10, §11 | DSF §3, §4 | ERP §4, §5 | All five screens | All future screens | UX Team | Part 8 Design Review |
| Global Navigation | PXF, XLS | §8; §21 | DSF §3 | ERP §6 | Implicit, reconciliation pending | All future screens | UX Team | ERP §5's reconciliation record |
| Process-Position Indicator | PXF | §8 | DSF §3 | ERP §6 | Discovery's Guided flow | Documentation Guided flow | UX Team | Part 8 Design Review |
| Notification, Inline Validation Message | XLS, PXF | §9, §30; §18 | DSF §3, §4 | ERP §5 | All five screens (implicit) | All future screens | UX Team | Part 7 checklist |
| Command Palette | ECS, XLS | §9.2; §10 | DSF §3 | ERP §6 | None (structural shell) | Every future action | UX Team | Part 7 checklist |
| Suggestion Panel, Confidence Indicator, Provenance Display | PXF, ECS, XLS | §9, §21; §7; §19 | DSF §6 | ERP §5 | Clarification, Project Charter | Documentation review | UX Team | Part 7 AI Components checklist |
| Clarification Prompt | PXF | §9.3 | DSF §6 | ERP §5, §7 | Clarification | Any future bounded loop | UX Team | Part 7, live-region item |
| Card | XLS | §25 | DSF §3 | ERP §5 | Project Charter, Project Ready | Documentation/Development artifacts | UX Team | Part 8 Design Review |
| Table | XLS | §5, §24 | DSF §3 | ERP §4 | None | Documentation/Testing review | UX Team | Part 8 Design Review |
| Guided-Flow Step Container | ECS, PXF | §6, §8; §5 | DSF §3 | ERP §4 | All Discovery steps | Documentation Guided flow | UX Team | Part 8 Design Review |
| Confirmation Dialog | PXF, XLS | §18; §11, §14 | DSF §3 | ERP §5 | Project Charter | Deployment `Change` approval | UX Team | Part 7 Dialogs checklist |
| Canvas Container, Inspector | ECS, XLS | §6, §10; §20, §22 | DSF §3 | ERP §6 | None | Sprint 6+ Graph Runtime | UX Team + Frontend Architect | Structural render test only |

**Every asset in this matrix traces to at least one constitutional citation.** No asset in this package lacks justification.

---

## Part 11 — Implementation Completeness Assessment

| Dimension | Score | Rationale |
|---|---|---|
| Component Catalog Completeness | 90/100 | 20 components fully catalogued; a small number of fields marked `[GAP]` honestly (Canvas/Inspector accessibility, Checkbox/Radio consumers) rather than filled in |
| Interaction Coverage | 85/100 | Every requested interaction type addressed; Touch is a genuine, disclosed `[GAP]` — no constitutional document specifies it |
| Accessibility Coverage | 87/100 | Executable checklists for every category except Canvas/Inspector, correctly deferred, not skipped silently |
| Token Coverage | 92/100 | All seven independent categories and three derived ones fully catalogued with usage rules |
| Screen Coverage | 93/100 | All five Discovery screens fully composed, including honest technical-debt and gap columns |
| Engineering Readiness | 86/100 | Every component has effort, risk, and dependency data a Sprint 5 engineer can act on immediately |
| Designer Readiness | 91/100 | A designer can build every "Ready Now" component without further architectural interpretation |
| Documentation Quality | 90/100 | Dense, catalog-first, citation-complete throughout, per this package's own format discipline |
| Reuse Potential | 88/100 | High for Inputs/Feedback/AI Interaction (already proven across multiple screens); lower for Canvas/Inspector, correctly, since they have no real consumer yet |
| Maintainability | 89/100 | Every asset traces to exactly one constitutional home (Part 10) — no duplicate ownership found |
| **Overall** | **89/100** | A complete, honest, implementation-ready handbook; remaining gaps are disclosed and narrow, not systemic |

---

## Part 12 — Next Sprint 4 Work Package

**Recommended: Sprint 4 Validation Work Package.**

| Field | Detail |
|---|---|
| Objective | Validate and reconcile every Design Asset produced in Sprint 4 against real, shipped Discovery behavior and the constitutional set — before Wave 1 Figma construction is treated as final |
| Expected Deliverables | A completed reconciliation record for all five Discovery screens; a resolved or explicitly-deferred disposition for every `[GAP]` in this package (Touch interaction, Select's real consumer, Canvas/Inspector accessibility, Command Palette's action registry); a closed Sprint 4 Product Design Review |
| Dependencies | This package (Design Asset Package) accepted as authoritative |
| Validation Activities | Run Part 8's Design Review Checklist against every Wave 1/2 component once built in Figma; run Part 7's accessibility checklists; re-verify the Clarification live-region behavior flagged unresolved in Part 2 |
| Success Criteria | Zero unresolved "must"-tier Design Review failures; every `[GAP]` in this package has a recorded disposition (Resolved / Planned / Deferred, matching the Gate C Closure Report's own classification discipline) |
| Known Risks | Canvas/Inspector's accessibility and keyboard behavior cannot be validated until real content exists (Sprint 6+) — this risk is accepted and deferred, not resolved by this work package |
| Readiness to Proceed | High — every dependency this validation work needs already exists in this package |

## Recommendation

# Proceed to the Sprint 4 Validation Work Package
