#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "$1"
  }

  readonly hook_name="$1"
  shift
  readonly hook_dir="$(cd "$(dirname "$0")/.." && pwd)"
  readonly husky_skip_init=1
  export husky_skip_init

  debug "husky:debug $hook_name hook started"
  . "$hook_dir/.huskyrc"
  readonly exitCode=$?
  debug "husky:debug $hook_name hook exited with code $exitCode"
  exit $exitCode
fi
