---
description: Push code changes to GitHub
---

1. Make all code changes and verify them locally
2. Run type check to confirm no errors:
   ```
   npx tsc --noEmit
   ```
3. **STOP. Notify the user with a summary of all changed files and what was changed.**
4. **Wait for explicit user approval** (e.g. "you may push" / "push it") before proceeding.
5. Only after approval, stage and push:
   ```
   git add .
   git status --porcelain
   git commit -m "<type>(<scope>): <description>"
   git push origin master
   ```
