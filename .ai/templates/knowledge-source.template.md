---
id: <kebab-case-knowledge-source-id>
classification: public | internal | synthetic-example   # never "customer" — see Ground rule 3 in .ai/README.md
owner: <team-or-person>
retrieval: static-bundle | retrieval-augmented           # matches the taxonomy in an agent's Context loading strategy
---

# Knowledge source: <Display Name>

## What this is
A short description of the content and where it came from (authored internally, adapted from public SAP documentation, synthetically generated for demo purposes — never a customer's actual data or documents).

## Scope
What questions/agents this is relevant to. A knowledge source with no stated scope tends to get pulled into every agent's context "just in case," which degrades retrieval quality for everyone — be specific.

## Freshness
How often this needs review to stay accurate (SAP product surfaces change), and who owns keeping it current.

## Content
<the actual reference material, or a pointer to where it lives if it's large/binary>
