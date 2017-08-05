#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

jsdoc -t node_modules/tsd-jsdoc -r VeloxScriptLoader.js -d ./
mv types.d.ts VeloxScriptLoader.d.ts