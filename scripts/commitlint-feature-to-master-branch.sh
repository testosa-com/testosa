#!/bin/bash
set -e

echo "[Commitlint: changes from feature to master branch]"
commitlint --from=HEAD~1
