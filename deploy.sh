#!/bin/bash
source /home/ubuntu/.bashrc
tmux kill-session -t wms
git fetch --all
git reset --hard origin/master
# 前端
cd frontend
yarn 
yarn build 
yarn deploy-linux
# 后端
cd ../backend
yarn
yarn build
tmux new -s session -d "NODE_ENV=production yarn start; bash"
