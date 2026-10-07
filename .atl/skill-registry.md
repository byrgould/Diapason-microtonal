# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a pull request, opening a PR, or preparing changes for review. | branch-pr | /Users/byron/.gemini/config/skills/branch-pr/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage. | go-testing | /Users/byron/.gemini/config/skills/go-testing/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature. | issue-creation | /Users/byron/.gemini/config/skills/issue-creation/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | judgment-day | /Users/byron/.gemini/config/skills/judgment-day/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | /Users/byron/.gemini/config/skills/skill-creator/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Every PR MUST link an approved issue — no exceptions
- Every PR MUST have exactly one `type:*` label
- Branch names MUST match regex: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
- Commit messages MUST match regex: `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+`
- Automated checks must pass before merge is possible

### go-testing
- Use table-driven tests for multiple test cases
- Test Model state transitions directly for Bubbletea
- Use Charmbracelet's teatest for TUI integration testing

### issue-creation
- Follow standard templates for bug, feature, and epic issues
- Label correctly according to severity and type

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize their findings, apply fixes, and re-judge
- Escalate after 2 iterations if both do not pass

### skill-creator
- Create specialized skills following the standard SKILL.md format
- Include name, description, trigger, and concise compact rules
- Place in appropriate skills directory (user-level or project-level)

## Project Conventions

| File | Path | Notes |
|------|------|-------|

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
