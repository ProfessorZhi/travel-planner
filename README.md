# Web 版 AI 旅行规划师

基于 React + Node.js + 阿里云百炼的智能旅行规划系统，提供 AI 生成行程、地图可视化等功能。

## 功能特点

- 🤖 AI 规划：集成阿里云百炼大模型，生成个性化旅行建议
- 🗺️ 地图可视化：集成高德地图，展示行程路线和景点信息
- 🗺️ 地图可视化：基于高德地图展示行程路线
- 👤 用户系统：支持注册、登录、保存行程
- 🔄 实时同步：云端存储，多设备访问
- 📱 响应式设计：支持桌面端和移动端

## 技术栈

- 前端：React + Vite
- 后端：Node + Express
- 认证/存储：Supabase
- 语音识别：Web Speech API + 科大讯飞（后备）
- 地图服务：高德地图
- 大语言模型：通义千问3 Max

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 yarn
- Docker（可选，用于容器化部署）

### 2. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd frontend
npm install
```

### Docker 快速启动

```bash
# 拉取最新镜像
docker pull registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/app:latest

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e AMAP_KEY=0f0618af64041f39a807569d78b37c7d \
  -e BAILIAN_API_KEY=sk-0479004179164997b5fdae1888704256 \
  registry.cn-hangzhou.aliyuncs.com/ai-travel-planner/app:latest
```

### 环境变量配置

项目使用以下 API Key：

```env
# 高德地图 API Key (有效期至 2026-02-11)
AMAP_KEY=0f0618af64041f39a807569d78b37c7d

# 阿里云百炼 API Key (有效期至 2026-02-11)
BAILIAN_API_KEY=sk-0479004179164997b5fdae1888704256
```

### 4. 本地开发

```bash
# 启动后端 (http://localhost:4000)
cd backend
npm run dev

# 启动前端 (http://localhost:3000)
cd frontend
npm run dev
```

### 5. Docker 部署

```bash
# 构建并启动所有服务
docker-compose up --build

# 仅重新构建某个服务
docker-compose up --build backend
```

## 项目结构

```
.
├── backend/                # 后端源码
│   ├── utils/             # 工具函数
│   │   └── qianwen.js     # 通义千问 API 调用
│   ├── index.js           # 主入口
│   └── Dockerfile         # 后端容器配置
├── frontend/              # 前端源码
│   ├── src/              
│   │   ├── components/    # React 组件
│   │   └── utils/        # 前端工具
│   └── Dockerfile        # 前端容器配置
└── docker-compose.yml    # 容器编排配置
```

## API 文档

### 主要接口

1. 行程规划
```http
POST /api/plan
Content-Type: application/json

{
  "input": "我想去日本，预算1万元，喜欢美食和动漫文化，5天行程"
}
```

2. 用户认证
```http
POST /api/auth/register
POST /api/auth/login
GET /api/plans  # 获取已保存的行程
```

## Supabase 数据库初始化

1. 创建 travel_plans 表：
```sql
create table public.travel_plans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users,
    input text,
    plan jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 设置 RLS 策略
alter table public.travel_plans enable row level security;

create policy "Users can read their own plans"
    on public.travel_plans for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own plans"
    on public.travel_plans for insert
    with check ( auth.uid() = user_id );
```

## CI/CD 配置

### GitHub Actions 配置

在仓库的 Settings -> Secrets 中添加以下变量：

- `ALIYUN_REGISTRY`: 阿里云容器镜像服务地址
- `ALIYUN_USERNAME`: 阿里云账号
- `ALIYUN_PASSWORD`: 阿里云访问密钥

### 阿里云容器服务配置

1. 创建命名空间（可选）
2. 创建镜像仓库
3. 获取访问凭证

## 评分要求与提交

1. 创建 PDF 文档，包含：
   - GitHub 仓库地址
   - 运行说明（本文档）
   - API 密钥配置指南

2. 在 README 中说明：
   - 项目功能演示视频/截图
   - 开发过程记录
   - 遇到的问题与解决方案

3. 确保所有 API Key 已从代码中移除，改为通过环境变量注入

## 开发团队

（项目信息）

## 许可证

MIT

## 操作指南（制品描述）

1. 登录阿里云 Container Registry
```bash
$ docker login --username=nick2650733193 crpi-dx5a494scg4cqf6f.cn-hangzhou.personal.cr.aliyuncs.com
```
用于登录的用户名为阿里云账号全名，密码为开通服务时设置的密码。

您可以在访问凭证页面修改凭证密码。

注意：使用 RAM 用户（子账号）登录镜像仓库时，不支持企业别名带有英文半角句号（.）。

2. 从 Registry 中拉取镜像
```bash
$ docker pull crpi-dx5a494scg4cqf6f.cn-hangzhou.personal.cr.aliyuncs.com/travel-planne/travel-planner:[镜像版本号]
```

3. 将镜像推送到 Registry
```bash
$ docker login --username=nick2650733193 crpi-dx5a494scg4cqf6f.cn-hangzhou.personal.cr.aliyuncs.com
$ docker tag [ImageId] crpi-dx5a494scg4cqf6f.cn-hangzhou.personal.cr.aliyuncs.com/travel-planne/travel-planner:[镜像版本号]
$ docker push crpi-dx5a494scg4cqf6f.cn-hangzhou.personal.cr.aliyuncs.com/travel-planne/travel-planner:[镜像版本号]
```
请根据实际镜像信息替换示例中的 `[ImageId]` 和 `[镜像版本号]` 参数。

4. 选择合适的镜像仓库地址

从 ECS 推送镜像时，可以选择使用镜像仓库内网地址。推送速度将得到提升并且将不会损耗您的公网流量。

如果您使用的机器位于 VPC 网络，请使用 `crpi-dx5a494scg4cqf6f-vpc.cn-hangzhou.personal.cr.aliyuncs.com` 作为 Registry 的域名登录。

5. 示例

使用 `docker tag` 命令重命名镜像，并将它通过专有网络地址推送至 Registry。

```bash
$ docker images
REPOSITORY                                                         TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
registry.aliyuncs.com/acs/agent                                    0.7-dfb6816         37bb9c63c8b2        7 days ago          37.89 MB
$ docker tag 37bb9c63c8b2 crpi-dx5a494scg4cqf6f-vpc.cn-hangzhou.personal.cr.aliyuncs.com/acs/agent:0.7-dfb6816
$ docker push crpi-dx5a494scg4cqf6f-vpc.cn-hangzhou.personal.cr.aliyuncs.com/acs/agent:0.7-dfb6816
```


