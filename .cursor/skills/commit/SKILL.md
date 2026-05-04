---
name: commit
description: Creates a git commit with a concise summary of completed work, pushes it to the repository primary branch, and reports success or the exact push failure. Use when the user invokes /commit or asks to commit and push to the main branch.
disable-model-invocation: true
---

# Commit

## Workflow

Use this skill only when the user explicitly invokes `/commit` or clearly asks to commit and push to the primary branch.

1. Stage all current changes:
   - Run `git add .`.

2. Inspect the repository state:
   - Run `git status --short --branch`.
   - Run `git diff --staged` and `git diff`.
   - Run `git log -5 --oneline` to follow the repository commit style.

3. Identify the primary branch:
   - Prefer `git symbolic-ref --short refs/remotes/origin/HEAD` and strip `origin/`.
   - If unavailable, use `main` when it exists; otherwise use `master` when it exists.
   - If the primary branch cannot be determined, stop and ask the user.

4. Before committing:
   - Confirm the current branch is the primary branch.
   - If the current branch is not the primary branch, stop and report that `/commit` only pushes directly from the primary branch.
   - Do not commit likely secret files such as `.env`, credentials, private keys, or tokens.
   - If there are no changes, stop and report that there is nothing to commit.

5. Create the commit:
   - Write a concise commit message summarizing the completed work.
   - Use a heredoc for the commit message:

```bash
git commit -m "$(cat <<'EOF'
Краткое описание выполненных работ

EOF
)"
```

6. Push to the primary branch:
   - Run `git push origin HEAD:<primary-branch>`.
   - Never use force push, `--no-verify`, or destructive git commands.

7. Report the result:
   - If push succeeds, tell the user that the commit was created and pushed successfully. Include the commit hash and branch.
   - If push fails, stop all further actions and explain the problem from the push output. Do not retry with force push or attempt unrelated fixes unless the user explicitly asks.

