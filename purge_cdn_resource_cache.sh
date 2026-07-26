#!/bin/bash

shopt -s globstar

grep '@resource' **/*.user.js | awk '{print $4}' | sed 's/cdn/purge/g' | xargs -I{} wget -qO - {}
