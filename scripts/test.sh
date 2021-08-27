#!/bin/sh
set -e

echo "[Jest]"
jest tests --detectOpenHandles
