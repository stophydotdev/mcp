# Changesets

Add a changeset for user-facing changes (new/changed/removed tools, README, env vars, packaging):

```bash
bun run changeset
```

When changesets land on `main`, GitHub opens a Version Packages pull request. Merging that pull request updates `package.json` and `CHANGELOG.md`, then the publish workflow publishes to npm (trusted publishing) and syncs the MCP registry.
