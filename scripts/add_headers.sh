
# Quick bash script to add license headers to each file.
# Note: doesn't work on Mac's version of `sed`, install GNU sed instead and change the below to use `gsed`

#for ext in js ts tsx css scss
#do
#  find src -type f -name "*.${ext}" -exec gsed -i '1i /* Copyright (c) Fortanix, Inc.\n|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not\n|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */' {} \;
#done
