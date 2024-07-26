#!/bin/bash
set -e

eval "$(dbus-launch --sh-syntax)"

echo "export GNOME_KEYRING_PASS=$GNOME_KEYRING_PASS" >> $BASH_ENV
echo "export DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS" >> $BASH_ENV
echo "DBUS_SESSION_BUS_PID=$DBUS_SESSION_BUS_PID" >> $BASH_ENV
echo "DBUS_SESSION_BUS_WINDOWID=$DBUS_SESSION_BUS_WINDOWID" >> $BASH_ENV

echo 'eval "$(gnome-keyring-daemon --unlock)"' >> $BASH_ENV
echo 'sleep 1' >> $BASH_ENV
echo 'eval "$(gnome-keyring-daemon --start)"' >> $BASH_ENV

yarn --cwd kt
