#!/bin/bash
npm run clean
npm run build
google-chrome --headless &
cd /home/appuser/app && npm run start