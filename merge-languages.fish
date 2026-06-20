#!/usr/bin/env fish
#
# There are four args:
# - base (ignored)
# - left
# - right
# - output

argparse --min-arguments 4 --max-arguments 4 -- $argv
or return

set -l left $argv[2]
set -l right $argv[3]
set -l output $argv[4]

set -l hometown_translation_keys \
    admin.settings.hometown \
    admin.settings.hometown.preamble \
    admin.settings.hometown.privacy \
    admin.settings.hometown.title

# First, we're getting the language as the key.
set -l lang (yq 'keys[0]'< $left)

left=$left yq '. *= load(strenv(left))' $right
