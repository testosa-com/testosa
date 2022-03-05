#!/bin/bash
set -e

echo "[Bump wiki version]"
nextVersion=$1
cd website
npm run version -- ${nextVersion}
cd ../
