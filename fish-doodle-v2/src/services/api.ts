import type { Fish } from '../types';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 后端API基础URL
// 在Vercel项目设置中已配置环境变量VITE_API_URL
// 环境变量名: VITE_API_URL
// 值: https://doodlecrew-backend.vercel.app
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 确保API地址已配置
if (!API_BASE_URL) {
  console.error('错误: 未配置后端API地址，请在Vercel项目设置中添加VITE_API_URL环境变量');
  throw new Error('Backend API URL is not configured');
} else {
  console.log('使用的API地址:', API_BASE_URL);
}

// 获取所有鱼
export const getAllFish = async (): Promise<Fish[]> => {
  try {
    // 模拟网络延迟
    await delay(300);
    
    // 直接调用后端API获取数据
    const response = await fetch(`${API_BASE_URL}/api/fish`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const fishData = await response.json();
      return fishData;
    } else {
      console.error('Backend API returned non-ok status:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`Failed to fetch fish data: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error fetching fish data:', error);
    throw error; // 直接抛出错误，不使用本地兜底
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
    
    // 直接调用后端API添加鱼
    console.log('尝试发送POST请求到:', `${API_BASE_URL}/api/fish`);
    
    const response = await fetch(`${API_BASE_URL}/api/fish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newFish)
    });
    
    console.log('API响应状态:', response.status);
    if (response.ok) {
      const addedFish = await response.json();
      console.log('鱼成功添加到数据库:', addedFish);
      return addedFish;
    } else {
      const errorText = await response.text();
      console.error('Failed to add fish to backend API:', response.status, errorText);
      throw new Error(`Failed to add fish: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to add fish:', error);
    throw error; // 直接抛出错误，不使用本地兜底
  }
};

// 更新鱼
export const updateFish = async (id: string, updates: Partial<Fish>): Promise<Fish | null> => {
  try {
    // 模拟网络延迟
    await delay(400);
    
    // 直接调用后端API更新鱼
    const response = await fetch(`${API_BASE_URL}/api/fish/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      const updatedFish = await response.json();
      return updatedFish;
    } else if (response.status === 404) {
      console.warn('Fish not found for update:', id);
      return null;
    } else {
      const errorText = await response.text();
      console.error('Failed to update fish in backend API:', response.status, errorText);
      throw new Error(`Failed to update fish: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to update fish:', error);
    throw error; // 直接抛出错误，不使用本地兜底
  }
};

// 删除鱼
export const deleteFish = async (id: string): Promise<boolean> => {
  try {
    // 模拟网络延迟
    await delay(300);
    
    // 直接调用后端API删除鱼
    const response = await fetch(`${API_BASE_URL}/api/fish/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return true;
    } else if (response.status === 404) {
      console.warn('Fish not found for deletion:', id);
      return false;
    } else {
      const errorText = await response.text();
      console.error('Failed to delete fish from backend API:', response.status, errorText);
      throw new Error(`Failed to delete fish: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to delete fish:', error);
    throw error; // 直接抛出错误，不使用本地兜底
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