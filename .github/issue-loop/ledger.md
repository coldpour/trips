# Issue Loop Ledger

Durable record of autonomous loop runs. One row per run. See `playbook.md`.

`outcome` ∈ {merged, pr-open, clarify, blocked, no-op}
`mutation-check` ∈ {pass, fail, ci, n/a}

| date | issue | PR | outcome | mutation-check | escapes-noticed | notes |
|------|-------|----|---------|----------------|-----------------|-------|
| _seed_ | — | — | no-op | n/a | 0 | Ledger initialized. First scheduled run pending. |
