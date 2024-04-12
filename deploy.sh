#!/bin/bash

# 设置重试间隔时间
retry_interval=3  # seconds
echo "===========环境变量=========="
env
echo "============================="

# 无限循环
while true; do
    echo "拉取仓库..."
    git fetch --all

    # 检查是否成功
    if [ $? -eq 0 ]; then
        echo "拉取成功"
        break
    else
        echo "拉取失败，重试..."
        sleep $retry_interval
    fi
done

git reset --hard origin/master

source /home/ubuntu/.bashrc
tmux kill-session -t wms

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
