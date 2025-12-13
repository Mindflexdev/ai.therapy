---
description: Git workflow for pushing changes
---

# Git Push Workflow

When pushing changes to the repository, ALWAYS follow this sequence:

// turbo-all
1. Stage all changes:
   ```
   git add .
   ```

2. Commit with a descriptive message:
   ```
   git commit -m "Your commit message"
   ```

3. **ALWAYS pull with rebase before pushing** to integrate any remote changes:
   ```
   git pull --rebase
   ```

4. Push to remote:
   ```
   git push
   ```

## Important Notes
- Never skip the `git pull --rebase` step
- If there are merge conflicts during rebase, resolve them before continuing
- This ensures we never overwrite remote changes made by other team members or Vercel deployments
