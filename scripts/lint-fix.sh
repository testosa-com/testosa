#!/bin/sh
set -e

echo "[Eslint]"
echo "Checking code quality..."
eslint . --fix
echo "Static code analysis complete!\n"

echo "[Prettier]"
prettier --check --write 'src/**/*.js'
