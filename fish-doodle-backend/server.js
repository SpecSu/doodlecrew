const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 内存存储 - 在实际生产环境中可以替换为数据库
let fishData = [];

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

  // 合并所有点用于向后兼容
  const mergePoints = (segments) => {
    const allPoints = [];
    segments.forEach(segment => allPoints.push(...segment.points));
    return allPoints;
  };

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
fishData = initializePresetFish();

// API端点

// 获取所有鱼
app.get('/api/fish', (req, res) => {
  res.json(fishData);
});

// 添加一条鱼
app.post('/api/fish', (req, res) => {
  try {
    const fish = req.body;
    
    // 确保鱼有唯一ID
    const newFish = {
      ...fish,
      id: fish.id || `fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    fishData.push(newFish);
    res.status(201).json(newFish);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add fish' });
  }
});

// 更新鱼
app.put('/api/fish/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fishIndex = fishData.findIndex(fish => fish.id === id);
    
    if (fishIndex === -1) {
      return res.status(404).json({ error: 'Fish not found' });
    }
    
    fishData[fishIndex] = {
      ...fishData[fishIndex],
      ...updates
    };
    
    res.json(fishData[fishIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fish' });
  }
});

// 删除鱼
app.delete('/api/fish/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = fishData.length;
    fishData = fishData.filter(fish => fish.id !== id);
    
    if (fishData.length === initialLength) {
      return res.status(404).json({ error: 'Fish not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fish' });
  }
});

// 清除所有鱼
app.delete('/api/fish', (req, res) => {
  try {
    fishData = [];
    res.json({ success: true });
  } catch (error) {
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