#!/bin/bash

if [ "$1" == "" ]; then
  echo Usage: $0 name
  echo "e.g.: ./migrate.sh userId"
  exit 0
fi
./node_modules/.bin/sequelize migration:create --name $1

