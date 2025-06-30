# 基于官方 Node 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 拷贝依赖文件
COPY package.json pnpm-lock.yaml tsconfig.server.json ./

# 安装 pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 拷贝项目文件
COPY . .
RUN ls -l api/server.ts

# 构建前端
RUN pnpm build

# 暴露端口（Vite 默认 5173，API 3001）
EXPOSE 5173 3001

# 启动服务
CMD ["pnpm", "start"]
