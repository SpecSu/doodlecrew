import { useState, useEffect } from 'react';
import DrawingTool from './components/DrawingTool';
import FishTank from './components/FishTank';
import type { Fish } from './types';
import { getAllFish, addFish } from './services/api';
import './App.css';

function App() {
  // 创建看起来像鱼的路径段函数
  const createFishPathSegments = (color: string): any[] => {
    // 鱼身体路径
    const bodyPoints = [
      { x: 0, y: 0 },
      { x: 30, y: -15 },
      { x: 50, y: -5 },
      { x: 70, y: 0 },
      { x: 50, y: 5 },
      { x: 30, y: 15 },
      { x: 0, y: 0 }
    ];
    
    // 鱼鳍路径
    const finPoints = [
      { x: 15, y: -10 },
      { x: 35, y: -25 },
      { x: 40, y: -10 },
      { x: 15, y: -10 }
    ];
    
    // 鱼尾路径
    const tailPoints = [
      { x: 70, y: 0 },
      { x: 90, y: -15 },
      { x: 70, y: -5 },
      { x: 90, y: 0 },
      { x: 70, y: 5 },
      { x: 90, y: 15 },
      { x: 70, y: 0 }
    ];
    
    return [
      { points: bodyPoints, color, lineWidth: 4 },
      { points: finPoints, color, lineWidth: 3 },
      { points: tailPoints, color, lineWidth: 3 }
    ];
  };
  
  // 鱼的状态
  const [fish, setFish] = useState<Fish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 提交鱼时的加载状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 从API加载鱼数据
  useEffect(() => {
    const loadFish = async () => {
      setIsLoading(true);
      try {
        const fishData = await getAllFish();
        
        // 如果API没有返回数据，使用默认的三条鱼
        if (fishData.length === 0) {
          const redFishSegments = createFishPathSegments('#FF5252');
          const blueFishSegments = createFishPathSegments('#536DFE');
          const greenFishSegments = createFishPathSegments('#4CAF50');
          
          const defaultFish = [
            {
              id: '1',
              path: [...redFishSegments[0].points, ...redFishSegments[1].points, ...redFishSegments[2].points],
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
              id: '2',
              path: [...blueFishSegments[0].points, ...blueFishSegments[1].points, ...blueFishSegments[2].points],
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
              id: '3',
              path: [...greenFishSegments[0].points, ...greenFishSegments[1].points, ...greenFishSegments[2].points],
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
          
          // 将默认鱼添加到API
          for (const fish of defaultFish) {
            await addFish(fish);
          }
          
          setFish(defaultFish);
        } else {
          setFish(fishData);
        }
      } catch (error) {
        console.error('Failed to load fish:', error);
        // 显示错误提示，不使用本地数据
        alert('无法连接到服务器，请稍后再试。');
        setFish([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFish();
  }, []);
  // 当前选择的颜色
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  // 页面状态（绘制页面或鱼缸页面）
  const [currentView, setCurrentView] = useState<'drawing' | 'tank'>('tank');
  
  // 定期刷新鱼数据，确保不同设备之间的数据同步，但保持现有鱼的动画状态
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (!isLoading && fish.length > 0) {
        try {
          const updatedFishFromAPI = await getAllFish();
          
          // 创建现有鱼ID的映射，保持它们的位置、速度等动画状态
          const existingFishMap = new Map(fish.map(f => [f.id, f]));
          
          // 更新鱼数据但保留动画状态
          const mergedFish = updatedFishFromAPI.map(apiFish => {
            const existingFish = existingFishMap.get(apiFish.id);
            if (existingFish) {
              // 保留现有鱼的动画状态（位置、速度等）
              return {
                ...apiFish,
                x: existingFish.x,
                y: existingFish.y,
                speedX: existingFish.speedX,
                speedY: existingFish.speedY,
                rotation: existingFish.rotation
              };
            }
            // 对于新鱼，直接使用API数据
            return apiFish;
          });
          
          // 只在有变化时更新状态
          if (JSON.stringify(mergedFish) !== JSON.stringify(fish)) {
            setFish(mergedFish);
          }
        } catch (error) {
          console.error('Failed to refresh fish data:', error);
        }
      }
    }, 10000); // 每10秒刷新一次
    
    return () => clearInterval(refreshInterval);
  }, [isLoading, fish]);
  
  // 处理鱼绘制完成
  const handleDrawingComplete = async (fish: Fish) => {
    setIsSubmitting(true);
    try {
      // 通过API添加新鱼
      await addFish(fish);
      
      // 重新获取所有鱼数据，避免重复添加
      const updatedFish = await getAllFish();
      setFish(updatedFish);
      
      // 切换到鱼缸视图
      setCurrentView('tank');
    } catch (error) {
      console.error('Failed to save new fish:', error);
      // 显示错误提示，不更新本地状态
      alert('无法保存你的鱼，请检查网络连接或稍后再试。');
      // 停留在绘制页面，让用户可以重试
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 重置并开始绘制新鱼
  const handleDrawNewFish = () => {
    setCurrentView('drawing');
  };
  
  // 页面标题和导航
  const renderHeader = () => (
    <header className="app-header">
      <h1 className="app-title">🐟 Doodle Fish</h1>
      <p className="app-subtitle">绘制你的鱼，让它在社区鱼缸中畅游</p>
      {currentView === 'tank' && (
        <button 
          className="draw-new-button"
          onClick={handleDrawNewFish}
        >
          绘制新鱼
        </button>
      )}
    </header>
  );
  
  return (
    <div className="app">
      {renderHeader()}
      
      <main className="app-main">
        {(isLoading || isSubmitting) && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>{isSubmitting ? '保存你的鱼到鱼缸中...' : '加载鱼群中...'}</p>
          </div>
        )}
        {currentView === 'drawing' ? (
          <DrawingTool
            onDrawingComplete={handleDrawingComplete}
            onViewFishTank={() => setCurrentView('tank')}
            color={selectedColor}
            onColorChange={setSelectedColor}
          />
        ) : (
          <FishTank fish={fish} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>🐟 分享你的创意，让世界看到你的鱼！</p>
      </footer>
    </div>
  );
}

export default App
