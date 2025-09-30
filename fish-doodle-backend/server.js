// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Fish = require('./models/fishModel');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库连接
// 打印环境变量加载情况，不打印完整连接字符串以保护安全
console.log('Checking environment variables...');
console.log('MONGO_URI is' + (process.env.MONGO_URI ? ' set' : ' not set'));
console.log('Using default URI:' + (!process.env.MONGO_URI));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fish-doodle';

// 打印连接字符串的主机部分，隐藏凭据信息
const uriParts = MONGO_URI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
console.log('Connecting to MongoDB host:', uriParts ? uriParts[1] : 'localhost:27017');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('Server selection error details:', err.reason);
    }
    // 如果连接失败，在控制台输出重试建议
    console.log('\n建议：\n1. 确保MongoDB服务正在运行\n2. 检查连接字符串是否正确\n3. 若使用云数据库，确保IP白名单设置正确\n4. 可以临时使用内存存储模式继续开发');
  });

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 如果数据库连接失败，使用内存存储作为后备
let memoryFishData = [];

// 检查数据库连接状态的辅助函数
const isDbConnected = () => mongoose.connection.readyState === 1;

// 合并所有点用于向后兼容
const mergePoints = (segments) => {
  const allPoints = [];
  segments.forEach(segment => allPoints.push(...segment.points));
  return allPoints;
};

// 初始化预设鱼数据
const initializePresetFish = () => {
  // 创建一些预设的鱼数据，确保所有用户至少能看到相同的初始鱼群
  const redFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#FF5252', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#FF5252', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#FF5252', lineWidth: 3 }
  ];

  const blueFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#536DFE', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#536DFE', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#536DFE', lineWidth: 3 }
  ];

  const greenFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#4CAF50', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#4CAF50', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#4CAF50', lineWidth: 3 }
  ];

  return [
    {
      id: 'preset-red',
      path: mergePoints(redFishSegments),
      paths: redFishSegments.map(seg => seg.points),
      pathSegments: redFishSegments,
      color: '#FF5252',
      x: 150,
      y: 200,
      rotation: 0,
      scale: 1,
      speedX: 0.3,
      speedY: 0.1
    },
    {
      id: 'preset-blue',
      path: mergePoints(blueFishSegments),
      paths: blueFishSegments.map(seg => seg.points),
      pathSegments: blueFishSegments,
      color: '#536DFE',
      x: 400,
      y: 150,
      rotation: Math.PI / 2,
      scale: 0.8,
      speedX: 0,
      speedY: 0.2
    },
    {
      id: 'preset-green',
      path: mergePoints(greenFishSegments),
      paths: greenFishSegments.map(seg => seg.points),
      pathSegments: greenFishSegments,
      color: '#4CAF50',
      x: 600,
      y: 250,
      rotation: Math.PI,
      scale: 0.9,
      speedX: -0.25,
      speedY: 0.1
    }
  ];
};

// 初始化数据
const initializeData = async () => {
  if (isDbConnected()) {
    try {
      // 检查数据库中是否已有鱼数据
      const fishCount = await Fish.countDocuments();
      if (fishCount === 0) {
        // 如果数据库为空，插入预设鱼数据
        const presetFish = initializePresetFish();
        await Fish.insertMany(presetFish);
        console.log('Inserted preset fish data into database');
      } else {
        console.log(`Found ${fishCount} fish in database`);
      }
    } catch (error) {
      console.error('Error initializing database data:', error);
      // 如果数据库操作失败，使用内存存储
      memoryFishData = initializePresetFish();
    }
  } else {
    // 如果数据库未连接，使用内存存储
    memoryFishData = initializePresetFish();
    console.log('Using in-memory storage since database is not connected');
  }
};

// 启动时初始化数据
initializeData();

// API端点

// 获取所有鱼
app.get('/api/fish', async (req, res) => {
  try {
    if (isDbConnected()) {
      const fish = await Fish.find();
      res.json(fish);
    } else {
      res.json(memoryFishData);
    }
  } catch (error) {
    console.error('Error getting fish data:', error);
    res.status(500).json({ error: 'Failed to get fish data' });
  }
});

// 添加一条鱼
app.post('/api/fish', async (req, res) => {
  try {
    const fish = req.body;
    
    // 确保鱼有唯一ID
    const newFish = {
      ...fish,
      id: fish.id || `fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    if (isDbConnected()) {
      const savedFish = await Fish.create(newFish);
      res.status(201).json(savedFish);
    } else {
      memoryFishData.push(newFish);
      res.status(201).json(newFish);
    }
  } catch (error) {
    console.error('Error adding fish:', error);
    res.status(500).json({ error: 'Failed to add fish' });
  }
});

// 更新鱼
app.put('/api/fish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (isDbConnected()) {
      const updatedFish = await Fish.findOneAndUpdate({ id }, updates, { new: true });
      if (!updatedFish) {
        return res.status(404).json({ error: 'Fish not found' });
      }
      res.json(updatedFish);
    } else {
      const fishIndex = memoryFishData.findIndex(fish => fish.id === id);
      if (fishIndex === -1) {
        return res.status(404).json({ error: 'Fish not found' });
      }
      
      memoryFishData[fishIndex] = {
        ...memoryFishData[fishIndex],
        ...updates
      };
      
      res.json(memoryFishData[fishIndex]);
    }
  } catch (error) {
    console.error('Error updating fish:', error);
    res.status(500).json({ error: 'Failed to update fish' });
  }
});

// 删除鱼
app.delete('/api/fish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbConnected()) {
      const result = await Fish.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Fish not found' });
      }
      res.json({ success: true });
    } else {
      const initialLength = memoryFishData.length;
      memoryFishData = memoryFishData.filter(fish => fish.id !== id);
      
      if (memoryFishData.length === initialLength) {
        return res.status(404).json({ error: 'Fish not found' });
      }
      
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting fish:', error);
    res.status(500).json({ error: 'Failed to delete fish' });
  }
});

// 清除所有鱼
app.delete('/api/fish', async (req, res) => {
  try {
    if (isDbConnected()) {
      await Fish.deleteMany({});
      res.json({ success: true });
    } else {
      memoryFishData = [];
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error clearing fish:', error);
    res.status(500).json({ error: 'Failed to clear fish' });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});