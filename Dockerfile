# 多阶段构建
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ARG AMAP_KEY
ENV VITE_AMAP_KEY=$AMAP_KEY
RUN npm run build

FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

FROM node:18-alpine
WORKDIR /app

# 复制构建产物
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend /app/backend

# 设置环境变量
ENV NODE_ENV=production
ARG BAILIAN_API_KEY
ENV BAILIAN_API_KEY=$BAILIAN_API_KEY

# 暴露端口
EXPOSE 3000

# 设置工作目录并启动
WORKDIR /app/backend
CMD ["npm", "start"]
