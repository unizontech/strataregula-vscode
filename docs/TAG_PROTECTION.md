# Tag Protection Setup

This document explains how to set up tag protection rules to prevent unauthorized releases and maintain CI/CD integrity.

## Why Tag Protection?

- **Prevent unauthorized releases**: Only authorized team members can create release tags
- **Ensure proper workflow**: Tags can only be created from main/master branch
- **Audit trail**: All tag operations are logged and require authentication
- **Safety net**: Prevents accidental or malicious release creation

## GitHub Settings Configuration

### 1. Enable Tag Protection Rules

1. Go to: **Settings** → **Code security and analysis** → **Tag protection rules**
2. Click **"New rule"**

### 2. Configure Release Tag Pattern

**Pattern:** `v*`
- Protects all version tags like `v0.2.1`, `v1.0.0`, etc.
- **Restrict pushes that create matching tags**: ✅ Enabled

### 3. Set Authorized Users/Teams

Choose one of:
- **Allow specified actors only**: `@strataregula/maintainers`
- **Allow repository admins**: ✅ (if small team)
- **Allow GitHub Apps**: Add specific apps if using automation

### 4. Advanced Protection (Optional)

- **Restrict pushes that create matching tags**: ✅
- **Restrict deletions of matching tags**: ✅
- **Restrict updates of matching tags**: ✅

## Release Workflow Integration

Our `release.yml` includes additional safeguards:

```yaml
- name: Tag must point to main/master history
  run: |
    git fetch --no-tags origin main || git fetch --no-tags origin master
    git merge-base --is-ancestor origin/main "$GITHUB_SHA" 2>/dev/null || \
    git merge-base --is-ancestor origin/master "$GITHUB_SHA" || {
      echo "❌ Tag must be reachable from main/master branch"
      exit 1
    }
```

This ensures tags can only be created from main branch commits.

## Proper Release Process

### ✅ Correct Process:

1. **Merge PR to main/master**
2. **Pull latest main/master**
   ```bash
   git checkout main
   git pull origin main
   ```
3. **Update version** (if not done in PR)
   ```bash
   # Update package.json version
   # Update CHANGELOG.md
   git commit -am "chore: bump version to v0.2.1"
   git push origin main
   ```
4. **Create and push tag**
   ```bash
   git tag -a v0.2.1 -m "Release v0.2.1"
   git push origin v0.2.1
   ```
5. **GitHub Actions automatically handles**:
   - Preflight checks (version consistency, changelog)
   - GitHub Release creation
   - VS Code Marketplace publishing

### ❌ Incorrect Process:

- Creating tags from feature branches
- Creating tags before merging to main
- Manual marketplace publishing outside of CI
- Pushing tags without proper version/changelog updates

## Troubleshooting

### "Failed to create tag: protected"

**Cause**: You don't have permission to create tags matching the protected pattern.

**Solution**: 
- Ask a maintainer to create the tag
- Check if you're in the authorized team/users list

### "Tag must be reachable from main/master branch"

**Cause**: Tag was created from a branch that's not merged to main.

**Solution**:
1. Merge your changes to main first
2. Create tag from main branch

### "Version mismatch" in CI

**Cause**: Tag version doesn't match package.json version.

**Solution**:
1. Update package.json version to match tag
2. Or delete tag and create new one with correct version

## Verification Checklist

After setting up tag protection:

- [ ] Try creating a tag without permission (should fail)
- [ ] Verify authorized users can create tags
- [ ] Test that tags from non-main branches are rejected by CI
- [ ] Confirm release workflow runs only on protected tag patterns

## Security Notes

- **Tag protection works with branch protection**: Both should be enabled
- **Audit logs**: All tag operations are logged in the repository audit log
- **Emergency access**: Repository admins can always create tags (if enabled)
- **Automation**: GitHub Apps can be granted specific tag creation permissions

## References

- [GitHub Docs: Tag Protection Rules](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-tag-protection-rules)
- [GitHub Docs: Managing Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)