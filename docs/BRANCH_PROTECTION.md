# Branch Protection Rules

This document outlines the recommended branch protection settings for the main/master branch to ensure "PR green = main works" guarantee.

## Required Settings (GitHub Repository Settings)

### 1. Basic Protection
- ✅ **Require a pull request before merging**
  - Dismiss stale pull request approvals when new commits are pushed
  - Require approval from at least 1 reviewer

### 2. Status Checks
- ✅ **Require status checks to pass before merging**
  - Required status checks:
    - `build-and-test` (from ci.yml)
    - `policy-checks` (from ci.yml)
    - `preflight` (from release.yml - for version consistency)
    - `runlog-guard` (existing)
    - `secret-audit` (existing)
    
- ✅ **Require branches to be up to date before merging**
  - This ensures PR is tested against latest main state
  - Prevents "works in PR but breaks in main" issues

### 3. Merge Requirements
- ✅ **Require conversation resolution before merging**
- ✅ **Include administrators** (recommended for consistency)

### 4. Optional but Recommended
- ⭕ **Require linear history** (easier to track changes)
- ⭕ **Enable merge queue** (for high-traffic repos)
- ⭕ **Require deployments to succeed** (if using deployment workflows)

## CI/CD Workflow Architecture

```
┌─────────────────┐
│   Pull Request  │
└────────┬────────┘
         ↓
    ┌────────┐
    │  CI.yml │ → Build, Test, Policy checks
    └────┬────┘
         ↓
    [All Green?]
         ↓
    ┌─────────┐
    │  Merge   │
    └────┬─────┘
         ↓
    ┌────────────┐
    │ Push: main │ → CI.yml runs again (backstop)
    └────┬───────┘
         ↓
    ┌──────────┐
    │ Tag: v*  │ → release.yml (publish to marketplace)
    └──────────┘
```

## Setting up Branch Protection (Step by Step)

1. Go to: Settings → Branches → Add rule
2. Branch name pattern: `main` (or `master`)
3. Enable all checkboxes mentioned above
4. Click "Create" or "Save changes"

## Verification Checklist

After setting up, verify:
- [ ] PRs cannot be merged without passing CI
- [ ] PRs must be up-to-date with main before merge
- [ ] Direct pushes to main are blocked
- [ ] Force pushes to main are blocked
- [ ] Administrators must also follow the rules

## Troubleshooting

### "Waiting for status to be reported"
- Ensure workflow files are on the default branch
- Check workflow has correct triggers (`pull_request`)
- Verify workflow permissions are set correctly

### "This branch is out-of-date with the base branch"
- Click "Update branch" button on PR
- Or manually: `git pull origin main && git push`

### "Required status check is expected"
- The workflow must run at least once on main branch
- Push a dummy commit to main to trigger initial run

## References
- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)