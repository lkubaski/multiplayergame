#!/usr/bin/env bash
set -e

clean_all() {
  echo "cleaning all..."
  rm -rf ./node_modules
  rm -f package-lock.json
}

build() {
  echo "building..."
  if [ ! -d "./node_modules" ]; then
    npm install
  fi
}

$1 # the function to invoke just needs to be provided as the first bash script parameter
