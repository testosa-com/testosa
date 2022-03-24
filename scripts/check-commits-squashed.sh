#!/bin/bash
set -e

echo "[Check commits squashed]"

LC_ALL=C

baseBranch=master
currentBranch=$CIRCLE_BRANCH

if [[ -n $CIRCLE_PULL_REQUEST ]]; then
  pullRequestUrl=$(echo https://api.github.com/repos/${CIRCLE_PULL_REQUEST:19} | sed "s/\/pull\//\/pulls\//")

  echo $pullRequestUrl
  base=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" $pullRequestUrl | jq '.base.ref')

  echo $base
fi

if [ -z $currentBranch ]; then
  currentBranch=$(git rev-parse --abbrev-ref HEAD)
fi

dependabotBranchRegex="^(dependabot)\/npm_and_yarn\/([a-zA-Z0-9_-].+\/)?epic\/(IN|PSS)-[0-9][0-9][0-9]\/.+$"
epicBranchRegex="^epic"

if [[ $currentBranch =~ $dependabotBranchRegex ]]; then
  printf "Branch $currentBranch is a dependabot branch. Skipping check for squashed commits.\n"
  exit 0
fi

if [[ $currentBranch =~ $epicBranchRegex ]]; then
  printf "Branch $currentBranch is an epic branch. Skipping check for squashed commits.\n"
  exit 0
fi

commitDiffCount=$(git rev-list --count HEAD "^$baseBranch")

echo "Found $commitDiffCount commits between the current branch and $baseBranch"

if [[ $commitDiffCount != 1 ]]; then
  echo "Change requests to the master branch should be squashed to a single commit."
  exit 1
fi
