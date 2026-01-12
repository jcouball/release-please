# GitHub Copilot Instructions for release-please

## Project Overview

`release-please` automates CHANGELOG generation, the creation of GitHub releases, and version bumps for your projects.

It parses your git history, looking for [Conventional Commit messages](https://www.conventionalcommits.org/), and creates release PRs. When you merge these release PRs, it tags the release and updates your changelog.

**Current Status:** Stable project used by many Google libraries. Written in TypeScript.
Compatible with Node.js 18+.

## AI Use Cases

This document guides AI agents in handling the following types of tasks. Each category includes a link to the workflow that should be followed.

### Issue Triage & Investigation

**→ Use [Development Workflow](#development-workflow) (Phase 0: TRIAGE only -- do not proceed to implementation)**

- **"Diagnose why release PR is not being created"** - Investigate logic flow in `Manifest` or `Strategy`
- **"Is issue #999 a bug or feature request?"** - Analyze and categorize issues
- **"Check if issue #999 is a duplicate"** - Search for similar existing issues

### Bug Fixes

**→ Use [Development Workflow](#development-workflow) (Phases 0-3: TRIAGE → PREPARE → EXECUTE → FINALIZE)**

- **"Fix issue #999"** - Implement a fix for a reported bug following the full TDD workflow
- **"Fix the regex in Java Linkage Monitor"** - Address specific bugs in regex or parsing logic
- **"Fix version bumping logic for Python"** - Address language-specific strategy bugs

### Feature Implementation

**→ Use [Development Workflow](#development-workflow) (Phases 0-3: TRIAGE → PREPARE → EXECUTE → FINALIZE)**

- **"Implement issue #999"** - Build new features requested in issues
- **"Add support for a new package manager"** - Implement a new `Strategy` or `Updater`
- **"Add a new plugin for Linked Versions"** - Implement a new `ManifestPlugin`

### Code Improvements

**→ Use [Development Workflow](#development-workflow) (Phases 1-3: PREPARE → EXECUTE → FINALIZE)**

- **"Refactor the Manifest class to reduce complexity"** - Improve code quality without changing behavior
- **"Add missing TypeDocs to public interfaces"** - Enhance documentation
- **"Improve test coverage for `Strategies`"** - Add missing tests

### Pull Request Review

**→ Use [Pull Request Review Workflow](#pull-request-review-workflow)**

- **"Review PR #999"** - Review a pull request, analyze changes against project standards
- **"Check if PR #999 follows our coding standards"** - Focused review on specific criteria

### Maintenance Tasks

**→ Use [Development Workflow](#development-workflow) (Phases 1-3: PREPARE → EXECUTE → FINALIZE)**

- **"Update dependencies"** - Update `package.json` dependencies
- **"Fix linting errors"** - Run `npm run fix` to address `gts` violations

## Architecture & Module Organization

The codebase is structured efficiently to handle multiple languages and release strategies:

- **Manifest (`src/manifest.ts`)** - The core orchestrator. It manages the repository state, configuration, and coordinates the release process across multiple packages (monorepo support).
- **Strategy (`src/strategy.ts`, `src/strategies/`)** - Determines which files need updating for a specific component (e.g., `NodeWorkspace`, `JavaRuby`, `Simple`). It builds the `CandidateRelease`.
- **VersioningStrategy (`src/versioning-strategy.ts`, `src/versioning-strategies/`)** - Determines the next version based on commits (e.g., `Default`, `AlwaysMinor`, `ServicePack`).
- **Updater (`src/update.ts`, `src/updaters/`)** - Responsible for parsing and updating content of specific files (e.g., `package.json`, `pom.xml`, `version.rb`).
- **Plugin (`src/plugin.ts`, `src/plugins/`)** - Hooks into the release lifecycle to perform cross-component actions (e.g., `LinkedVersions`, `WorkspacePlugin`).
- **GitHub (`src/github.ts`)** - Wrapper around `octokit` for GitHub API interactions.
- **Factory (`src/factory.ts`, `src/factories/`)** - Factory pattern used to register and create instances of Strategies, Plugins, and ChangelogNotes.

Key directories:
- `src/` - Core source code (TypeScript)
- `src/bin/` - CLI entry point
- `src/strategies/` - Language-specific release strategies
- `src/updaters/` - File-specific content updaters
- `test/` - Mocha test suite
- `schemas/` - JSON schemas for configuration

## Coding Standards

High-quality code is essential. Adhere to the following standards:

### TypeScript Style

- **Strict Typing:** Avoid `any` wherever possible. Use interfaces and types defined in `src/`.
- **GTS (Google TypeScript Style):** The project uses `gts` for linting and formatting. Run `npm run fix` to automatically format code.
- **Async/Await:** Prefer async/await over raw Promises.

### Code Organization

- **Modularity:** Keep strategies and updaters isolated in their respective directories.
- **Factory Registration:** When creating a new strategy or plugin, ensure it is registered in the appropriate factory (`src/factory.ts` or `src/factories/`).

### Naming Conventions

- **Classes:** PascalCase (e.g., `ReleasePullRequest`, `JavaStrategy`).
- **Variables/Methods:** camelCase.
- **Files:** kebab-case (e.g., `release-pull-request.ts`).

## Design Philosophy

`release-please` is designed to be **opinionated** based on the Conventional Commits specification.

### Convention over Configuration

- Releases are driven by commit messages, not manual inputs.
- `fix:` triggers a patch release.
- `feat:` triggers a minor release.
- `BREAKING CHANGE:` triggers a major release.

### Release PRs as the Mechanism

- Instead of releasing immediately, the tool maintains a "Release PR".
- Merging this PR triggers the actual tag and GitHub Release creation.

### Monorepo First

- The `Manifest` architecture is designed to handle multiple components in a single repository, each with its own versioning cycle.

## Project Configuration

- **Language:** TypeScript
- **Runtime:** Node.js
- **Test Runner:** Mocha (via `npm test`)
- **Linter:** GTS (Google TypeScript Style)

> **INSTRUCTIONS FOR AI:** Read these commands and use them strictly for the phases below.

- **Setup Project:** `npm install && npm run compile`
- **Run All Tests:** `npm test`
- **Run A Specific Test:** `npm run test:run -- <test_file_path>` (e.g., `npm run test:run -- build/test/test.manifest.js`)
- **Run Linters:** `npm run lint`
- **Fix Lint Errors:** `npm run fix`
- **Compile:** `npm run compile`

## Development Workflow

You are an expert and practical software engineer following a strict Test-Driven Development (TDD) workflow.

**This project strictly follows Test Driven Development (TDD) practices. All production code MUST be written using the TDD process described below.**

### Workflow Overview

When assigned a task involving a GitHub issue, follow this workflow:

1. **Phase 0: TRIAGE** - Understand the issue and determine if action is needed
2. **Phase 1: PREPARE** - Set up the environment and plan the implementation
3. **Phase 2: EXECUTE** - Implement the solution using TDD
4. **Phase 3: FINALIZE** - Squash commits and create the PR

### Core TDD Principles

- **Never Write Production Code without a Failing Test**
- **Bug Fixes Start with Tests:** Before fixing any bug, write a failing test that demonstrates the bug.
- **Tests Drive Design:** Let the test dictate the API and architecture.
- **Write Tests Incrementally:** Build tests in small steps.
- **Tests Should Be Atomic:** Each test should verify exactly one logical behavior.

### Phase 0: TRIAGE

**Use this phase when the user references a GitHub issue number.**

1. **Fetch the Issue:** Use `gh issue view #999` to read the full issue content.
2. **Understand the Request:** Analyze if it's a bug, feature, or question.
3. **Search for Context:**
   - Use `grep_search` or `semantic_search` to find relevant code.
   - Look for related code in `src/strategies` or `src/updaters` if it's language-specific.
4. **Reproduce (if applicable):** Try to reproduce the issue.
5. **Determine Next Steps.**

### Phase 1: PREPARE

**Only proceed to this phase if Phase 0 determined that implementation is needed.**

1. **Check Uncommitted Changes.**
2. **Create Feature Branch:** `git checkout -b <type>/<short-description>`.
3. **Verify Project Setup:** Run `npm install && npm run compile`.
4. **Verify Clean Baseline:** Run `npm test` to ensure the project is stable.
5. **Analyze and Plan:** Break work into small tasks.
6. **Consider Refactoring:** Look for ways to simplify implementation.

### Phase 2: EXECUTE

The purpose of this phase is to implement each planned task using strict TDD cycles.

1. **RED-GREEN:** Write failing tests and implement code to make them pass.
2. **REFACTOR:** Improve code quality and design without changing behavior.
3. **VERIFY:** Confirm the task is complete and code meets quality standards.
4. **COMMIT:** Create a commit for the completed task.
5. **REPLAN:** Review the implementation plan.

#### RED-GREEN Step

- Create a new test file in `test/` or add to an existing one.
- Run the test using `npm run test:run -- <path_to_test_file>` to confirm it fails.
- Write the minimum code in `src/` to make the test pass.
- Run `npm run compile` (TypeScript compilation is required).
- Run the test again to verify it passes.

#### REFACTOR Step

- Improve code quality.
- Run `npm test` to ensure no regressions.

#### VERIFY Step

- Run `npm test` (all tests).
- Run `npm run lint`.
- Run `npm run fix` (if needed).

#### COMMIT Step

- Commit changes with a Conventional Commit message (e.g., `feat: add support for cargo workspaces`).

### Phase 3: FINALIZE

- Push the branch and create a PR.
