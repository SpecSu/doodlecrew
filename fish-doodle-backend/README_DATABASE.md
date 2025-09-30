# Fish Doodle 数据库设置指南

为了永久保存用户创建的鱼作品，我们使用MongoDB作为数据库解决方案。本指南将帮助您设置和配置数据库。

## 目录

- [1. 本地开发环境设置](#1-本地开发环境设置)
- [2. 数据库连接配置](#2-数据库连接配置)
- [3. 生产环境部署](#3-生产环境部署)
- [4. 数据模型说明](#4-数据模型说明)
- [5. 故障排除](#5-故障排除)

## 1. 本地开发环境设置

### 安装MongoDB

#### macOS

使用Homebrew安装MongoDB：

```bash
brew tap mongodb/brew
brew install mongodb-community
```

启动MongoDB服务：

```bash
brew services start mongodb-community
```

#### Windows

从MongoDB官网下载并安装MongoDB Community Server：https://www.mongodb.com/try/download/community

安装完成后，启动MongoDB服务：

```powershell
net start MongoDB
```

#### Linux

请参考MongoDB官方文档，根据您的Linux发行版选择合适的安装方法：https://www.mongodb.com/docs/manual/administration/install-on-linux/

### 验证安装

打开命令行工具，输入以下命令连接到MongoDB：

```bash
mongo
```

如果成功连接，您将看到MongoDB的命令提示符。

## 2. 数据库连接配置

### 本地开发环境

默认情况下，应用程序会尝试连接到本地MongoDB实例：`mongodb://localhost:27017/fish-doodle`

如果您的MongoDB配置不同，可以通过环境变量`MONGO_URI`来指定连接字符串。

### 设置环境变量

#### macOS/Linux

在终端中运行：

```bash
export MONGO_URI="mongodb://localhost:27017/fish-doodle"
```

或者将其添加到您的`.bashrc`或`.zshrc`文件中，使其永久生效。

#### Windows

在命令提示符中运行：

```powershell
set MONGO_URI="mongodb://localhost:27017/fish-doodle"
```

或者在系统环境变量中设置。

## 3. 生产环境部署

### 使用MongoDB Atlas

MongoDB Atlas是MongoDB的云服务提供商，提供免费的入门级套餐：

1. 访问https://www.mongodb.com/cloud/atlas并创建账户
2. 创建一个新的集群
3. 配置网络访问（允许所有IP或特定IP）
4. 创建数据库用户
5. 获取连接字符串

### 在Vercel上配置

如果您在Vercel上部署应用，需要在Vercel项目设置中添加环境变量：

1. 登录Vercel，进入项目设置
2. 导航到"环境变量"部分
3. 添加一个名为`MONGO_URI`的环境变量，值为您的MongoDB连接字符串
4. 重新部署项目

### 其他云服务

如果您使用其他云服务提供商（如阿里云、腾讯云等），请参考其文档设置MongoDB实例并配置连接字符串。

## 4. 数据模型说明

### 鱼数据模型

```javascript
const FishSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  path: { type: [PointSchema], required: true },
  paths: { type: [[PointSchema]], required: true },
  pathSegments: { type: [PathSegmentSchema], required: true },
  color: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  rotation: { type: Number, required: true },
  scale: { type: Number, required: true },
  speedX: { type: Number, required: true },
  speedY: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 子模型

```javascript
// 点模型
const PointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

// 路径段模型
const PathSegmentSchema = new mongoose.Schema({
  points: { type: [PointSchema], required: true },
  color: { type: String, required: true },
  lineWidth: { type: Number, required: true }
});
```

## 5. 故障排除

### 数据库连接问题

如果应用无法连接到MongoDB，请检查以下几点：

1. 确保MongoDB服务正在运行
2. 检查连接字符串是否正确
3. 验证数据库用户的权限
4. 如果使用云数据库，确保IP白名单设置正确

### 数据持久化问题

如果您发现数据没有持久保存，请确认：

1. 应用成功连接到数据库（查看控制台输出）
2. 数据库操作没有错误（查看错误日志）
3. 数据库用户有读写权限

### 内存存储后备机制

如果数据库连接失败，应用会自动切换到内存存储模式，确保应用仍然可以运行，但请注意：

- 内存中的数据在应用重启后会丢失
- 建议修复数据库连接问题以确保数据持久保存

## 6. 迁移现有数据

如果您之前已经有一些鱼数据想要迁移到数据库，可以使用以下方法：

1. 确保MongoDB服务正在运行
2. 启动应用，它会自动创建数据库和集合
3. 使用MongoDB的导入工具将数据导入数据库

---

通过本指南，您应该能够成功设置和配置Fish Doodle的数据库，实现用户作品的永久保存。如有任何问题，请参考MongoDB官方文档或联系技术支持。