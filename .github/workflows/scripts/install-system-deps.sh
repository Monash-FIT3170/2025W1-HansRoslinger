#!/usr/bin/env bash
set -euo pipefail

echo "Installing system dependencies..."

sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libexpat1 \
  libfontconfig1 \
  libgbm-dev \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  wget \
  xvfb

if apt-cache show libasound2 >/dev/null 2>&1; then
  sudo apt-get install -y --no-install-recommends libasound2
else
  sudo apt-get install -y --no-install-recommends libasound2t64
fi
