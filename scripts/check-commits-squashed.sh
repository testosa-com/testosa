#!/bin/bash
set -e

echo "[Check commits squashed]"

LC_ALL=C

BASE_BRANCH=master

currentBranch=$CIRCLE_BRANCH

if [ -z $currentBranch ]; then
  currentBranch=$(git rev-parse --abbrev-ref HEAD)
fi

dependabotBranchRegex="^(dependabot)\/npm_and_yarn\/([a-zA-Z0-9_-].+)"
epicBranchRegex="^epic"

if [[ $currentBranch =~ $dependabotBranchRegex ]]; then
  printf "Branch $currentBranch is a dependabot branch. Skipping check for squashed commits.\n"
  exit 0
fi

if [[ $currentBranch =~ $epicBranchRegex ]]; then
  printf "Branch $currentBranch is an epic branch. Skipping check for squashed commits.\n"
  exit 0
fi

commitDiffCount=$(git rev-list --count HEAD "^$BASE_BRANCH")

echo "Found $commitDiffCount commits between the current branch and $BASE_BRANCH"

if [[ $commitDiffCount != 1 ]]; then
  echo "Change requests to the master branch should be squashed to a single commit."
  exit 1
fi
