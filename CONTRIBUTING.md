# Contributing

## Contents
* [Code Style](#code-style)
* [Git Policies and Workflows](#git-policies-and-workflows)
  * [Branch Naming](#branch-naming)
  * [Commits](#commits)
  * [Git Hooks](#git-hooks)
  * [Merge vs. Rebase](#merge-vs-rebase)
  * [Making a Pull Request](#making-a-pull-request)
  * [Revert vs. Rollback](#revert-vs-rollback)
* [Dependency Updates](#dependency-updates)
  * [Merging Dependency Updates](#merging-dependency-updates)

## Code Style
In an effort to maintain code quality and consistency across the formatting of the codebase, we leverage [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/) to establish formatting and code style norms. Our linting rules are based on the [Airbnb Style Guide](https://github.com/airbnb/javascript), which is represented in the [eslint-config-airbnb-base](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) configuration. Our own _.eslintrc_ file applies a few configuration options, which override the AirBnb configuration defaults. And, the aim is to keep these exceptions to a minimum.

Note: Code linting is applied automatically as a pre-commit hook during local development and again within the CI status checks before and after merge to the master.

## Git Policies and Workflows
All feature development should take place in a _working branch_ forked from `master`. The `master` branch represents the official repository history and should never contain broken code. All code changes should be properly reviewed and approved in a pull request and tested in a CI job _before_ being merged into the master.

The high level workflow for integrating a new feature is as follows:
1. Checkout the master branch -- `git checkout master`
2. Fetch the latest changes -- `git pull`
3. Create a new feature forked from the `master` branch -- `git checkout -b <BRANCH_NAME>`
4. Apply code changes -- `git add . && git commit . -m "<COMMIT_MSG>"`
5. Push your changes to the remote branch -- `git push --set-upstream origin <BRANCH_NAME>`
6. On GitHub, create a pull request and assign the appropriate reviewers
7. Once approved and CI status checks have all passed, rebase/squash your changes and merge your pull request
8. Delete your feature branch

### Branch Naming
To help easily identify the context of a working branch, a convention is used as a guide for naming branches: `<branch-type>/<short-summary>`

Note: _Branch type_ may be one of _bugfix_, _build_, _docs_, _feature_, _improvement_, _revert_, _test_, which should reflect the primary work completed in the branch.

A script, `npm run check:branch-name` has been created to validate the branch name. This script is set to run as a pre-push git hook and as well as in the CircleCI status check when a pull request is created.

### Commits
#### Atomic Commits
Throughout the local development process, contributors should aim to create frequent atomic commits, where commits focuses on a single context (eg. feature, bug fix, refactor, upgrade task etc.). Such commits are easier to read, understand, track, review and revert. See [https://www.freshconsulting.com/atomic-commits/](https://www.freshconsulting.com/atomic-commits/) for more context.

#### Commit Messages
Commit message should be clear and concise and provide context on the type of change being implemented. To maintain consistency with commit messages, we use [Commitlint](https://commitlint.js.org/#/) + the [config/conventional](https://www.npmjs.com/package/@commitlint/config-conventional) configuration, which enforces rules on the format and structure of commit messages.

#### Squashed Commits
In order to help keep the change history of the master branch clean, it is encouraged to squash all commits on your working branch to a single commit message. This keeps a singular context of each merged PR on the master branch and avoids having clean up commit messages leaking into the history of the master.

Note:
- Squashing commits should ideally be done as the **last** step before merging a reviewed and approved PR. This helps reviewers to step through changes you've have made while developing and addressing PR comments.
- The CircleCI Lint job validates that PRs contain only one (1) commit message before merging and that this message is linted to meet our commit convention.

### Git Hooks
In an effort to keep the project repository up-to-date with consistent code style, git hooks have been created to run code quality scripts before committing changes. If any of the scripts in the hooks below report an error the commit will be aborted, which encourages you to fix the code quality issues before proceeding.

Git hooks are managed via [https://www.npmjs.com/package/husky](husky), which allows adding the appropriates scripts to run via the scripts block in the package.json.

NOTE: In exceptional cases, you have the option to skip the hooks by simply adding the `--no-verify` flag to the commit or push command (`git commit -m "<YOUR_MSG>" --no-verify` or `git push --no-verify`)

The following hooks have been enabled and will be automatically installed when you run `npm install` at any time:
- **pre-commit** -- Code formatting (Prettier), code quality (Eslint) fixed NPM package version validation
- **pre-push** -- Unit tests (Jest), git branch name validation

### Merge vs. Rebase
Gamma uses **rebasing** as a team policy. The main goal of this workflow is to establish and maintain code history that is flat and readable. When work on a feature branch is complete, rebase/squash your changes down to a single commit before merging your pull request. This workflow is most effective when the following guidelines are followed:
1. **You're developing locally** -- While working on your forked branch, periodically rebase the `master` branch onto your feature branch to stay up to date with the latest changes. It is safe to push your feature branch changes to the remote repository at any time. And, if you have rebased at any point in time, it will require a force push (`git push --force`).
2. **Your code is ready for review.** -- You create a pull request, others are reviewing your work and are potentially fetching it into their fork for local review. At this point you should _not_ rebase your work. You should create new commits and update your feature branch. This helps with traceability in the pull request, and prevents the accidental history breakage.
3. **Review is done and ready to be integrated into the target branch.** -- Given that other developers won't be fetch-merging in these changes from this point on, this is your chance to sanitize history. At this point you can rewrite history and squash all your commits into single commit that represents the total work done in your PR.

##### Auto-rebasing on pull
To aid adopting a rebase workflow in local development, you may set git to rebase (instead of merge) by default when doing a git pull using:
```
git config --global pull.rebase true
```

### Making a Pull Request
As a part of improving and maintaining good code quality, all feature changes must go through a pull request, which requires at least two (2) approvals from the team. The workflow is as follows:
1. A developer creates the feature in a dedicated branch in their local repo
2. The developer pushes the branch to the remote repository
3. The developer creates a pull request via the GitHub UI
4. The rest of the team reviews the code, discusses it while offering kudos and, if necessary, proposing changes
5. The contributor (PR author) merges the feature into the official repository and closes the pull request

Note: Pull requests should also serve as a forum to discuss an in-progress or proposed features or changes.

In order to provide consistency in format and context provided in pull request description, a [pull request template](./PULL_REQUEST_TEMPLATE.md) has been included in the repository. The template aims to capture the description of the changes, steps to demo/reproduce the implementation and a checklist of common steps to complete in each pull request.

IMPORTANT: Please refer to the [guide to code reviews](./A_GUIDE_TO_CODE_REVIEWS.md) as a set of best practices for both authors and reviewers to engage in healthy collaboration during the code review process.

### Revert vs. Rollback
In the event that a critical or blocking bug/change has been merged into the `master` a decision has to be made on whether to fix the issue or revert to a previous stable version. If the best course of action is to revert the master, use **git-revert** to implement that change. This ensures that:
- The history of the `master` branch is not rewritten
- A linear history of the changes to the master is maintained and matches the build history of the application in the CI/CD pipeline

To revert a change that has been merged to master:
1. Identify the commit for the change you wish to revert
2. Fork a new feature branch from the `master`
3. Revert the offending commit -- `git revert <COMMIT_HASH>`
4. Push your changes to the remote branch
5. Create a pull request for the revert
6. Merge the pull request after code review approval and CI status checks have all passed

## Dependency Updates
- NPM dependencies are set to be updated via Dependabot and PRs to merge all found updates are automatically created against the `build/dependency-updates` epic branch.
- The configuration for Dependabot is stored in the repo at _.github/dependabot.yml_
- As new merge requests are made by Dependabot we will review, rebase if necessary and merge those changes to the epic branch.
- Once a month, we will manually validate all features of the library to ensure none of the updated dependencies introduce any bugs or unexpected behaviour. The updates branch can then be merged to the master.

### Merging dependency updates
- Commit message prefixes `build(deps)` and `build(deps-dev)` will be flagged to create a new patch version of the library to ensure that these changes bump the library version, which can be easily skipped by a venture app if a regression is introduced.
- There is **no need** to squash commits, even though multiple `build:` commits are made, only one patch version bump will result from merging the epic branch into `master`
- Before merging the epic branch into `master`, it is important to do the following
  - rebase the updates branch
  - delete the `node_modules` folder, and `package-lock.json`, and do a clean `npm install`.
  - commit the new `package-lock.json` to the repo
  - run E2Es and test on the Platform Sandbox app
