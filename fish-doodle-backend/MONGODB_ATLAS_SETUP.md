# MongoDB Atlas 配置指南

根据日志分析，您的应用已经成功加载了环境变量并尝试连接到MongoDB Atlas集群，但由于IP白名单限制导致连接失败。请按照以下步骤完成配置：

## 1. 添加IP白名单

1. 登录到 [MongoDB Atlas 控制台](https://cloud.mongodb.com/)
2. 选择您的项目（应该是包含 `doodlebase` 集群的项目）
3. 点击左侧导航栏的 **Network Access**
4. 点击 **Add IP Address** 按钮
5. 在弹出窗口中：
   - 选择 **ADD CURRENT IP ADDRESS** 自动添加您当前的IP
   - 或者选择 **ALLOW ACCESS FROM ANYWHERE** 以允许所有IP访问（生产环境不推荐）
   - 为这个IP设置一个描述，例如 "Development Machine"
6. 点击 **Confirm** 保存设置

## 2. 验证数据库用户权限

确保您使用的数据库用户 `specsu` 拥有足够的权限：

1. 在Atlas控制台，点击左侧导航栏的 **Database Access**
2. 找到用户 `specsu`，点击 **Edit**
3. 确保该用户至少拥有 **Read and write to any database** 权限
4. 如果需要，您可以重置密码（重置后需要更新.env文件中的连接字符串）

## 3. 重启后端服务器

IP白名单设置生效后，重启后端服务器：

```bash
# 在fish-doodle-backend目录下运行
npm run dev
```

## 4. 验证连接状态

查看服务器日志，如果看到以下信息，表示连接成功：

```
Connected to MongoDB successfully
Database connection state: 1
```

## 5. 测试数据持久化

您可以通过前端应用创建一些鱼作品，然后重启服务器验证数据是否被持久保存。

## 常见问题排查

- **连接超时**: 确保您的网络环境允许访问MongoDB Atlas（某些企业网络可能有防火墙限制）
- **认证失败**: 检查连接字符串中的用户名和密码是否正确
- **权限不足**: 确保数据库用户有足够的读写权限
- **集群状态**: 在Atlas控制台检查集群状态是否正常

如果您需要进一步的帮助，请随时提供最新的错误日志。