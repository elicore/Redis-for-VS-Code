#!/bin/bash
set -e

export V4=4
echo "V5=5" >> $BASH_ENV
echo "export V6=6" >> $BASH_ENV

echo "V4:$V4"
echo "V5:$V5"
echo "V6:$V6"
