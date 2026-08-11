#!/bin/bash
timestamp=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="/var/www/uiux-multiverse/releases/$timestamp"
git clone https://github.com/3bud-ZC/UIUX-Multiverse.git $RELEASE_DIR
cd $RELEASE_DIR
npm install
npm run build
ln -sfn $RELEASE_DIR /var/www/uiux-multiverse/current
pm2 delete uiux-multiverse || true
cd /var/www/uiux-multiverse/current
PORT=3077 pm2 start npm --name "uiux-multiverse" -- run start
pm2 save
