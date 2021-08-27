#!/bin/sh
set -e

echo "[Eslint]"
eslint .
echo "Static code analysis complete!\n"

echo "[Prettier]"
prettier --check **/*.js
echo "Code formatting valid!\n"
