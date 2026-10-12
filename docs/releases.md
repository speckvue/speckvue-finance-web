# Private-repository release workflow

Speckvue Finance is a public-facing product with proprietary source maintained in a private repository. package.json is private, npm publication is disabled, GitHub releases are created within the private repository, and no container or compiled artifact is uploaded publicly. Git tags, release metadata and changelog updates follow the private repository access controls; customers use the hosted product without receiving an open-source license to its code.

Conventional Commits drive semantic-release's analyzer, release notes, changelog, package/lockfile version updates, Git tags, and GitHub release metadata. Plugins are commit-analyzer, release-notes-generator, changelog, npm (npmPublish=false), git, and github (draftRelease=false). No NPM_TOKEN is required for this private application.

Husky's pre-commit hook runs lint-staged. The commit-msg hook validates all messages with commitlint/config-conventional. Use npm run commit for a prompt; it commits only files already staged. The helper never stages files automatically.

The release workflow follows successful Verify frontend runs on main and checks that main still points to the exact verified revision. It runs on a standard GitHub-hosted Ubuntu runner. Older completions are skipped when main has advanced. Only the current verified revision can release. Release commits include [skip ci] to prevent recursive runs.

The GitHub token needs permission to push the release commit/tag and create repository releases. The built-in token works only if repository permissions/branch rules allow it; configure RELEASE_TOKEN as a repository secret for an authorized automation identity when required by those rules. No credential is stored in source. For an authorized local release, set GITHUB_TOKEN in the ignored .env; the release wrapper loads it without printing it.

```text
npm run release:dry-run
npm run release
```

These commands require committed Git history, a configured remote/main branch, and appropriate credentials. A dry run still checks remote permissions. They were not executed during scaffold creation to avoid initiating a release or remote mutation. The analyzer, plugin resolution, conventional-message validation and private publishing settings are verified with local fixtures instead.

The initial frontend scaffold uses package.json version 0.1.0. Establish v0.1.0 on the verified initial commit as the matching baseline before pushing main; subsequent Conventional Commits determine later versions. This avoids semantic-release treating the untagged repository as a new 1.0.0 release. Keep a Changelog supplies the document header; generated release sections follow semantic-release's Conventional Commit grouping.

Private CodeQL scanning requires GitHub Code Security. This repository currently returns a code-scanning-disabled response and exposes no enabled security entitlement. The CodeQL job is opt-in through the CODEQL_ENABLED repository variable; set it to true only after the entitlement is available and scanning is enabled. No paid plan was activated. Repository rulesets also return a plan-upgrade-required response; existing private visibility and access permissions are preserved.
