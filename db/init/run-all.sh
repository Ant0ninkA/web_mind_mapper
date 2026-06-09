#!/usr/bin/env bash
set -e

URI="${MONGO_URI:-mongodb://localhost:27017/mindmapper}"

echo "Running init scripts against: $URI"
echo ""

for script in \
  01-create-collection.js \
  02-create-indexes.js \
  04-create-users-collection.js \
  05-create-users-indexes.js \
  06-create-share-tokens-collection.js \
  07-create-share-tokens-indexes.js
do
  echo "▶ $script"
  mongosh "$URI" "$(dirname "$0")/$script" --quiet
done

echo ""
echo "Done. All collections and indexes are ready."
