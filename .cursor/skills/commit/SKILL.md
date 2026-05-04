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

2. Ensure Cursor Agent is not listed as a contributor:
   - Check staged changes and contributor metadata for entries that add Cursor Agent as a contributor. Search for names or identifiers such as `Cursor Agent`, `cursor-agent`, `cursoragent`, or Cursor-owned bot emails.
   - Inspect common contributor files when present: `package.json`, `package-lock.json`, `README.md`, `CONTRIBUTORS.md`, `.all-contributorsrc`, and similar project contributor metadata.
   - If Cursor Agent has already been added, remove only that contributor entry while preserving other user changes.
   - Run `git add .` again after removing the entry.

3. Inspect the repository state:
   - Run `git status --short --branch`.
   - Run `git diff --staged` and `git diff`.
   - Run `git log -5 --oneline` to follow the repository commit style.

4. Identify the primary branch:
   - Prefer `git symbolic-ref --short refs/remotes/origin/HEAD` and strip `origin/`.
   - If unavailable, use `main` when it exists; otherwise use `master` when it exists.
   - If the primary branch cannot be determined, stop and ask the user.

5. Before committing:
   - Confirm the current branch is the primary branch.
   - If the current branch is not the primary branch, stop and report that `/commit` only pushes directly from the primary branch.
   - Do not commit likely secret files such as `.env`, credentials, private keys, or tokens.
   - If there are no changes, stop and report that there is nothing to commit.

6. Create the commit:
   - Write only a short commit message summarizing the completed work.
   - For a large commit, use a short commit message plus a brief description body.
   - Do not add anything else to the commit message. Never add trailers or metadata such as `Co-authored-by`, `co-contributor`, coauthor lines, contributor lines, or similar attribution.
   - Use a heredoc for the commit message:

```bash
git commit -m "$(cat <<'EOF'
Краткое описание выполненных работ

Краткое описание, только если коммит большой

EOF
)"
```

7. Push to the primary branch:
   - Run `git push origin HEAD:<primary-branch>`.
   - Never use force push, `--no-verify`, or destructive git commands.

8. Report the result:
   - If push succeeds, tell the user that the commit was created and pushed successfully. Include the commit hash and branch.
   - If push fails, stop all further actions and explain the problem from the push output. Do not retry with force push or attempt unrelated fixes unless the user explicitly asks.

