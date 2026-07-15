# Discovery Workshop Review

Per the review's own instruction, this is the most important feature in Sprint 1 — it's the one real AI-guided experience the entire sprint exists to deliver (SAF-39 through SAF-47, SAF-52). Evaluated against the already-authored [.ai/agents/requirements-analyst/agent.md](../../../.ai/agents/requirements-analyst/agent.md) and the UX design in [docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md).

## Dimension-by-dimension evaluation

| Dimension | Current design | Assessment |
|---|---|---|
| **Adaptive questioning** | Clarifications are generated dynamically per idea (not a fixed question bank) — the agent raises exactly the ambiguities *this* idea has, per its own Escalation rule ("any requirement this agent cannot structure with reasonable confidence becomes a Clarification, not a best-effort guess"). | Genuinely adaptive, not a static form. Strong foundation. |
| **Business language** | The agent's stated Purpose is to play "the role a business analyst plays at the start of an SAP delivery engagement" — its inputs/outputs are business-shaped (`Requirement`, `AcceptanceCriterion`), not technical. | Correct by design. |
| **Technical language** | None currently leaks into Discovery — no Fiori/CAP/CDS terminology appears anywhere in the agent's Responsibilities or the UX wireframes. | Correct — technical language belongs downstream, in Sprint 3+'s generation screens, not Discovery. |
| **Conversation flow** | Structured, multi-step (idea → clarifications → review), not a single continuous chat transcript. | Deliberate, defensible choice (see [docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md)'s scope decision) — but see "interview vs. workshop vs. questionnaire" below; this is the dimension most in need of the recommended improvements. |
| **Context awareness** | The agent's Memory is project-scoped and explicitly retains "the running set of previously extracted `Requirement`s and unresolved `Clarification`s ... so a second pass doesn't re-ask a question already answered." | Real, designed context retention — not stateless per-call prompting. |
| **Document uploads** | Not in Sprint 1. See [04-document-intelligence-review.md](04-document-intelligence-review.md). | Correctly deferred — text-only intake is an honest MVP. |
| **Requirement refinement** | `AnswerClarification` (SAF-46) re-invokes structuring with the updated context — refinement is a real re-pass, not a one-shot. | Correct, and matches how a human analyst would actually work. |
| **AI recommendations** | The agent only structures and asks; it does not currently *recommend* anything (e.g., suggest additional acceptance criteria the user didn't think of). | Gap — see recommendations below. |
| **Progress indication** | Not currently designed — the UX wireframes show a submission and then either clarifications or a review screen, with no visible "structuring in progress, here's what's been found so far" state. | Gap — see recommendations below. |
| **Confidence calculation** | No numeric confidence score is computed or stored. | Correctly not over-engineered as a new domain field (see [01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md)'s Requirement Confidence section) — a derived, presentation-only badge is the right-sized fix, not a new capability. |
| **Branching logic** | Binary: clarifications outstanding → loop; none outstanding → proceed to review. No deeper branching (e.g., a `Clarification`'s answer materially changing which *other* clarifications are still relevant) is currently modeled. | Sufficient for Sprint 1's scope; deeper branching is a legitimate Future improvement once real usage shows it's needed. |
| **Missing information detection** | This *is* what a `Clarification` represents — the agent's core mechanism, not a separate feature. | Already the design's central strength. |
| **Gap analysis** | Only within a single document — no cross-document or cross-project gap analysis (e.g., "this looks similar to a requirement raised in another project"). | Correctly out of scope — no second project exists yet for Sprint 1 to compare against. |

## Interview, consulting workshop, or static questionnaire?

**Honest assessment: as currently scoped, the design sits between "interview" and "static questionnaire," and needs the recommendations below to reliably land on "consulting workshop."**

What already pushes it toward "interview"/"workshop": the questions are generated dynamically from the actual idea, not drawn from a fixed bank; the agent retains context across the clarification loop; the underlying capability model treats this as an ongoing structuring pass, not a one-shot form parse.

What currently risks it reading as "static questionnaire": clarification questions are shown with no visible link back to *why* they're being asked (no quoted context from the original idea); there's no visible sense of the "consultant" working — no progressive structuring output, no "recommendations," just a submit-and-wait followed by a flat list; nothing signals building rapport or continuity across the loop beyond the agent's own internal memory, which the user never sees evidence of.

## Recommended improvements (none require a new capability, story, or sprint)

1. **Quote the source text driving each clarification.** Already the single highest-leverage fix (also recommended in [01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md)) — turns "why is it asking this?" into visible cause-and-effect, the core signal of "someone is actually engaging with what I wrote," not running it through a form-matcher.
2. **Show structuring progress, not a bare spinner.** Even without genuinely incremental output, staged status messages ("Reading your idea...", "Identifying requirements...", "Checking for gaps...") mimic the pacing of a real analyst working through material, and cost nothing beyond UI copy — no backend change.
3. **Surface at least one AI recommendation alongside structuring**, not only clarifying questions — e.g., a suggested acceptance criterion the user didn't state but the agent inferred as implied, shown as an editable suggestion rather than a silent addition (which the agent's own Escalation rule already prohibits — never assume). This is the smallest possible step toward "AI recommendations" without violating the agent's own "never guess" rule: recommend, but always as a proposal the human can accept or reject, never a silent fact.
4. **Reference continuity across the loop explicitly** — e.g., "Thanks — based on your answer, here's the updated picture" framing on re-entry to the review screen after a clarification round, rather than presenting the second pass as if it were the first.

All four are UI/prompt-output presentation choices layered on top of SAF-44/46/47's existing scope — none changes the agent's Responsibilities, adds a port, or touches the frozen architecture.

## Score

**7/10 as currently scoped in the backlog and UX doc; 9/10 with the four recommendations above applied** — all cheap, all presentation-layer, none a scope change.
