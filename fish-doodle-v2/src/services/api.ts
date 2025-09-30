import type { Fish, Point, PathSegment } from '../types';

// 创建一些预设的鱼数据，确保所有用户至少能看到相同的初始鱼群
const createPresetFish = (): Fish[] => {
  // 红色鱼
  const redFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#FF5252', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#FF5252', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#FF5252', lineWidth: 3 }
  ];

  // 蓝色鱼
  const blueFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#536DFE', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#536DFE', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#536DFE', lineWidth: 3 }
  ];

  // 绿色鱼
  const greenFishSegments = [
    { points: [{x:0,y:0},{x:30,y:-15},{x:50,y:-5},{x:70,y:0},{x:50,y:5},{x:30,y:15},{x:0,y:0}], color: '#4CAF50', lineWidth: 4 },
    { points: [{x:15,y:-10},{x:35,y:-25},{x:40,y:-10},{x:15,y:-10}], color: '#4CAF50', lineWidth: 3 },
    { points: [{x:70,y:0},{x:90,y:-15},{x:70,y:-5},{x:90,y:0},{x:70,y:5},{x:90,y:15},{x:70,y:0}], color: '#4CAF50', lineWidth: 3 }
  ];

  // 合并所有点用于向后兼容
  const mergePoints = (segments: PathSegment[]) => {
    const allPoints: Point[] = [];
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

// 本地备份键名
const LOCAL_BACKUP_KEY = 'fish-doodle-local-backup';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 后端API基础URL
// 在生产环境中，需要在Vercel项目设置中配置正确的后端API地址作为环境变量
// 环境变量名: VITE_API_URL
// 例如: https://your-backend-api-url.com
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 获取所有鱼
export const getAllFish = async (): Promise<Fish[]> => {
  try {
    // 模拟网络延迟
    await delay(300);
    
    try {
      // 尝试从后端API获取数据
      const response = await fetch(`${API_BASE_URL}/api/fish`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const fishData = await response.json();
        // 保存到本地备份
        localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(fishData));
        return fishData;
      } else {
        console.warn('Backend API returned non-ok status:', response.status);
      }
    } catch (apiError) {
      console.warn('Backend API unavailable, using local backup:', apiError);
    }
    
    // 尝试从本地备份获取数据
    const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (localBackup) {
      try {
        return JSON.parse(localBackup);
      } catch (e) {
        console.error('Failed to parse local backup:', e);
      }
    }
    
    // 所有方法都失败时，返回预设鱼数据
    const presetFish = createPresetFish();
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(presetFish));
    return presetFish;
  } catch (error) {
    console.error('Error fetching fish data:', error);
    
    // 所有方法都失败时，返回预设鱼数据
    const presetFish = createPresetFish();
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(presetFish));
    return presetFish;
  }
};

// 添加一条鱼
export const addFish = async (fish: Fish): Promise<Fish> => {
  try {
    // 模拟网络延迟
    await delay(500);
    
    // 确保鱼有唯一ID和所有必填字段
    const newFish = {
      ...fish,
      id: fish.id || `fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      // 确保所有必填字段都有值
      speedX: fish.speedX !== undefined ? fish.speedX : 0.1,
      speedY: fish.speedY !== undefined ? fish.speedY : 0.05,
      rotation: fish.rotation !== undefined ? fish.rotation : 0,
      x: fish.x !== undefined ? fish.x : Math.random() * 800 + 100,
      y: fish.y !== undefined ? fish.y : Math.random() * 400 + 100,
      scale: fish.scale !== undefined ? fish.scale : 1
    };
    
    // 添加调试日志，检查提交的数据
    console.log('准备提交的鱼数据:', newFish);
    console.log('检查必填字段:', {speedX: newFish.speedX, speedY: newFish.speedY, rotation: newFish.rotation});
    
    try {
      // 尝试添加到后端API
      const response = await fetch(`${API_BASE_URL}/api/fish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFish)
      });
      
      if (response.ok) {
        const addedFish = await response.json();
        // 更新本地备份
        try {
          const allFish = await getAllFish();
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(allFish));
        } catch (e) {
          console.error('Failed to update local backup after adding fish:', e);
        }
        return addedFish;
      } else {
        console.warn('Failed to add fish to backend API:', response.status);
      }
    } catch (apiError) {
      console.warn('Backend API unavailable when adding fish:', apiError);
    }
    
    // 添加失败时，使用本地备份
    const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
    const localFish = localBackup ? JSON.parse(localBackup) : [];
    localFish.push(newFish);
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(localFish));
    
    return newFish;
  } catch (error) {
    console.error('Failed to add fish:', error);
    
    // 添加失败时，使用本地生成的鱼数据
    const newFish = {
      ...fish,
      id: fish.id || `fish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // 尝试保存到本地备份
    try {
      const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
      const localFish = localBackup ? JSON.parse(localBackup) : [];
      localFish.push(newFish);
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(localFish));
    } catch (e) {
      console.error('Failed to save to local backup:', e);
    }
    
    return newFish;
  }
};

// 更新鱼
export const updateFish = async (id: string, updates: Partial<Fish>): Promise<Fish | null> => {
  try {
    // 模拟网络延迟
    await delay(400);
    
    try {
      // 尝试更新后端API中的鱼
      const response = await fetch(`${API_BASE_URL}/api/fish/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedFish = await response.json();
        // 更新本地备份
        try {
          const allFish = await getAllFish();
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(allFish));
        } catch (e) {
          console.error('Failed to update local backup after updating fish:', e);
        }
        return updatedFish;
      } else if (response.status === 404) {
        console.warn('Fish not found for update:', id);
        return null;
      } else {
        console.warn('Failed to update fish in backend API:', response.status);
      }
    } catch (apiError) {
      console.warn('Backend API unavailable when updating fish:', apiError);
    }
    
    // 尝试更新本地备份
    const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (localBackup) {
      try {
        const localFish = JSON.parse(localBackup);
        const fishIndex = localFish.findIndex((f: Fish) => f.id === id);
        
        if (fishIndex !== -1) {
          localFish[fishIndex] = {
            ...localFish[fishIndex],
            ...updates
          };
          
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(localFish));
          return localFish[fishIndex];
        }
      } catch (e) {
        console.error('Failed to update local backup:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to update fish:', error);
    return null;
  }
};

// 删除鱼
export const deleteFish = async (id: string): Promise<boolean> => {
  try {
    // 模拟网络延迟
    await delay(300);
    
    try {
      // 尝试从后端API删除鱼
      const response = await fetch(`${API_BASE_URL}/api/fish/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 更新本地备份
        try {
          const allFish = await getAllFish();
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(allFish));
        } catch (e) {
          console.error('Failed to update local backup after deleting fish:', e);
        }
        return true;
      } else if (response.status === 404) {
        console.warn('Fish not found for deletion:', id);
        return false;
      } else {
        console.warn('Failed to delete fish from backend API:', response.status);
      }
    } catch (apiError) {
      console.warn('Backend API unavailable when deleting fish:', apiError);
    }
    
    // 尝试从本地备份删除
    const localBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (localBackup) {
      try {
        const localFish = JSON.parse(localBackup);
        const updatedFish = localFish.filter((f: Fish) => f.id !== id);
        
        if (updatedFish.length < localFish.length) {
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updatedFish));
          return true;
        }
      } catch (e) {
        console.error('Failed to update local backup:', e);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to delete fish:', error);
    return false;
  }
};

// 清除所有鱼
export const clearAllFish = async (): Promise<void> => {
  try {
    // 模拟网络延迟
    await delay(300);
    
    try {
      // 尝试清除后端API中的所有鱼
      const response = await fetch(`${API_BASE_URL}/api/fish`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 清除本地备份
        localStorage.removeItem(LOCAL_BACKUP_KEY);
      } else {
        console.warn('Failed to clear fish from backend API:', response.status);
      }
    } catch (apiError) {
      console.warn('Backend API unavailable when clearing fish:', apiError);
    }
    
    // 只清除本地备份
    localStorage.removeItem(LOCAL_BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear fish:', error);
  }
};