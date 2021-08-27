#!/bin/bash
set -e

echo "[Check branch name]"

LC_ALL=C

currentBranch=$CIRCLE_BRANCH

if [ -z $currentBranch ]
then
  currentBranch=$(git rev-parse --abbrev-ref HEAD)
fi

validFeatureBranchRegex="^(bugfix|build|chore|ci|dependabot|docs|epic|feature|improvement|revert|test)\/[A-za-z0-9\\/._-]+$"
validDependabotBranchRegex="^dependabot"

if [[ ! $currentBranch =~ $validFeatureBranchRegex ]] && [[ ! $currentBranch =~ $validDependabotBranchRegex ]]
then
  printf "Invalid branch name: \"$currentBranch\". Please rename your branch using the following format: <branch-type>/<short-summary>. \n\nValid branch types include: \n - bugfix \n - build \n - chore \n - ci \n - dependabot \n - docs \n - epic \n - feature \n - improvement \n - revert \n - test \n\n"
  exit 1
fi

echo "Working branch name valid!"
