# 鱼涂鸦应用 (Fish Doodle)

一个交互式的鱼涂鸦应用，用户可以绘制自己的鱼并将它们添加到共享的鱼缸中。

## 项目结构

```
traeproject/
├── fish-doodle-v2/       # 前端应用
│   ├── src/              # 前端源代码
│   ├── dist/             # 构建后的静态文件
│   └── package.json      # 前端依赖配置
└── fish-doodle-backend/  # 后端服务器
    ├── server.js         # Express.js后端实现
    └── package.json      # 后端依赖配置
```

## 技术栈

- **前端**: React, TypeScript, Vite
- **后端**: Express.js

## 本地开发

### 前端开发

1. 进入前端目录
   ```bash
   cd fish-doodle-v2
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

### 后端开发

1. 进入后端目录
   ```bash
   cd fish-doodle-backend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```
   后端服务器将在 http://localhost:3000 上运行

### 在本地测试完整应用

1. 同时启动前端和后端开发服务器
2. 前端应用将自动连接到本地后端API
3. 打开浏览器访问 http://localhost:5173 (或前端开发服务器显示的地址)

## 构建与部署

### 前端构建

```bash
cd fish-doodle-v2
npm run build
```
构建后的文件将生成在 `dist` 目录中

### 部署指南

由于这个应用包含前后端代码，您需要将它部署到支持Node.js的平台上。以下是几个推荐的部署平台：

#### 部署到Vercel

1. 注册并登录Vercel账号
2. 创建两个新项目：一个用于前端，一个用于后端
3. 分别连接对应的代码仓库
4. 为后端项目设置构建命令 `npm install && npm run build` 和启动命令 `npm start`
5. 为前端项目设置环境变量 `VITE_API_URL`，指向已部署的后端API地址

#### 部署到Render

1. 注册并登录Render账号
2. 创建两个新服务：一个用于前端，一个用于后端
3. 分别连接对应的代码仓库
4. 配置构建命令和启动命令
5. 为前端服务设置环境变量 `VITE_API_URL`，指向已部署的后端API地址

#### 部署到Heroku

1. 注册并登录Heroku账号
2. 安装Heroku CLI
3. 为前后端分别创建新应用
4. 部署代码并配置环境变量

## API 端点

后端API提供以下端点：

- **GET /api/fish**: 获取所有鱼
- **POST /api/fish**: 添加一条新鱼
- **PUT /api/fish/:id**: 更新一条鱼
- **DELETE /api/fish/:id**: 删除一条鱼
- **DELETE /api/fish**: 清除所有鱼
- **GET /health**: 健康检查端点

## 环境变量

前端应用支持以下环境变量：
- `VITE_API_URL`: 后端API的基础URL（默认为 http://localhost:3000）

## 数据持久化

请注意，当前的后端实现使用内存存储数据。在实际部署时，建议配置数据库以实现数据的持久化存储。您可以轻松修改 `server.js` 文件，将数据存储切换到MongoDB、PostgreSQL等数据库。

## 故障排除

如果遇到连接问题，请确保：
1. 后端服务器正在运行
2. 前端配置了正确的后端API地址
3. 防火墙设置允许前后端通信
