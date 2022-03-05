#!/bin/bash
set -e

echo "[Bump wiki version]"
nextVersion=$1
cd wiki/website
npm run version ${nextVersion}
cd ../../
