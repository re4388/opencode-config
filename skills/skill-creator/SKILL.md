---
name: skill-creator
description: Create new skills, and edit or sharpen existing ones. Use whenever the user wants to create, write, or build a skill, turn a workflow into a reusable process, make an existing skill shorter or clearer, or fix a skill's description so it triggers reliably — even when they never say the word "skill" (e.g. "save this as a reusable process", "this skill keeps missing").
---

# Skill Creator

This skill owns the **process**: whether a skill is warranted, getting a baseline, matching the guidance to the failure, and testing the trigger. The **writing** — pointers, information hierarchy, leading words, pruning tests — belongs to the `writing-for-agents` skill. Read that first; read its `writing-for-agents/SKILL-MECHANICS.md` for frontmatter, invocation choice and router skills. Nothing here repeats it.

## 1. Should this be a skill?

```
Repeats across sessions?
├── No  → one-off prompt. Stop.
└── Yes → has known failure patterns or fixed resources?
    ├── No  → a reference snippet, not a skill
    └── Yes → has a verifiable "done"?
        ├── No  → a reusable prompt template
        └── Yes → create a skill
```

Rule of thumb: the third time you write the same long prompt.

Things that are **not** skills: project conventions (those go in `AGENTS.md`), anything a regex or validator can enforce, one-off solutions, and standard practice that a capable model already does. The last one is the most common waste — see the no-op test in `writing-for-agents`.

## 2. Capture intent

Ask, or mine the conversation if the user already showed you the workflow:

- What should the agent be able to do afterwards?
- When should it fire? Real user phrasings, file types, symptoms.
- What does good output look like?
- Scripts, or instructions only?

If the user says "turn this into a skill", extract it from the transcript first: the tools used, the order of steps, the corrections they made. Confirm the gaps rather than inventing them.

## 3. Watch it fail first

The one step people skip, and the one that decides whether the skill teaches anything. **If you never saw an agent get this wrong without the skill, you don't know what to write.**

1. **RED** — run the task with a subagent, no skill. Record what it did and the exact words it used to justify it. Those justifications are the skill's targets.
2. **GREEN** — write the smallest skill that blocks those specific failures. Nothing for hypothetical ones.
3. **REFACTOR** — rerun. New excuse appears, add one counter, retest.

Always keep a no-guidance control. If the baseline doesn't fail, there is nothing to fix — stop, don't author the skill.

Cheap wording pretest before spending real runs: one fresh-context sample per call, 5+ reps, guidance in a realistic system prompt, task chosen to tempt the failure. If five reps give five different behaviours, the wording isn't binding — tighten the form, don't add words.

Reference-only skills (API docs, syntax tables) skip pressure testing; test retrieval instead — can an agent find the right fact and apply it?

## 4. Match the form to the failure

The wrong form makes things worse, not just weaker.

| Baseline failure | Right form | Backfires |
|---|---|---|
| Breaks a rule under pressure | Prohibition + rationalization table | "prefer…", "consider…" |
| Right idea, wrong output shape | Positive recipe: what the output IS, in order | Prohibition list |
| Drops a required element | REQUIRED slot in the template it fills | Reminder near the template |
| Behaviour depends on a condition | Conditional on an observable predicate | Unconditional rule + exemption |

Prohibitions backfire on shaping problems: under a competing incentive the agent negotiates with "don't X". And "don't X unless it matters" reopens the negotiation you just closed.

## 5. Script it, or say it

A step that is deterministic belongs in `scripts/`, not in prose. A script is executed, not read: zero context load. It also can't be talked around the way an instruction can, and it fails with a non-zero exit instead of returning a plausible wrong answer. `--help` doesn't go stale either; a sentence describing a tool does.

Not scriptable: work the model already does reliably (pass the no-op test first), anything requiring judgment ("ask one question when the brief is vague"), and one-offs — a CLI has to be written, tested and kept alive.

Sizing: a fixed sequence of more than a few lines → script; one or two trivial commands → inline them; facts and tables → a reference file. Tell the skill how to call it and what it prints.

Discovery beats guessing: if the same helper turned up independently in three baseline runs, bundle it.

## 6. Triggers

- Description states the branches that should fire it, in the user's words.
- Do not summarize the workflow in the description — an agent that reads the summary follows it instead of reading the skill.
- Anti-trigger test: write 3 requests that look similar but should **not** fire it. Can't? The description is too broad.
- If the skill should only ever fire by hand, make it user-invoked and pay no context load. See `writing-for-agents/SKILL-MECHANICS.md`.

## 7. Prune before shipping

Run every line through the no-op test and delete whole sentences, not words. Then check: does a referenced file exist, one hop from SKILL.md? Is the same meaning in two places? Would a second agent, reading this cold, know what to do next?

## Checklist

- [ ] Failed without the skill; the failures are named in it
- [ ] Form matches the failure type (§4)
- [ ] Deterministic steps live in `scripts/`, and SKILL.md says how to call them and what they print
- [ ] 3 should-trigger and 3 should-not-trigger prompts written, and actually tried
- [ ] Description carries trigger branches, not a workflow summary
- [ ] No line the model already obeys by default
- [ ] Every referenced file exists, one hop away
- [ ] Same term for the same thing throughout

---

Need measured results — pass rates, token cost, A/B against a baseline? Upstream `anthropics/skills` ships the full `skill-creator` with that harness. This one stops at "proven by hand".
