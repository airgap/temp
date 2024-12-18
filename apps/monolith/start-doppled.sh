#!/bin/sh

echo "Running with doppler"
doppler run -- bun run start

# Do not remove the .sh from the end of this file
# If you do, pm2 will treat it as javascript
# Because apparently they're too good for hashbangs
