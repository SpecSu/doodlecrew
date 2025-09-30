import { useState, useEffect } from 'react';
import DrawingTool from './components/DrawingTool';
import FishTank from './components/FishTank';
import type { Fish } from './types';
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
  const [fish, setFish] = useState<Fish[]>(() => {
    // 尝试从localStorage加载保存的鱼数据
    try {
      const savedFish = localStorage.getItem('savedFish');
      if (savedFish) {
        const parsedFish = JSON.parse(savedFish);
        // 确保数据格式正确
        if (Array.isArray(parsedFish) && parsedFish.length > 0) {
          return parsedFish;
        }
      }
    } catch (error) {
      console.error('Failed to load saved fish:', error);
    }
    
    // 如果没有保存的数据或加载失败，使用默认的三条鱼
    const redFishSegments = createFishPathSegments('#FF5252');
    const blueFishSegments = createFishPathSegments('#536DFE');
    const greenFishSegments = createFishPathSegments('#4CAF50');
    
    return [
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
  });
  // 当前选择的颜色
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  // 页面状态（绘制页面或鱼缸页面）
  const [currentView, setCurrentView] = useState<'drawing' | 'tank'>('tank');
  
  // 保存鱼的数据到localStorage
  useEffect(() => {
    if (fish.length > 0) {
      localStorage.setItem('savedFish', JSON.stringify(fish));
    }
  }, [fish]);
  
  // 处理鱼绘制完成
  const handleDrawingComplete = (fish: Fish) => {
    // 添加新鱼到列表
    setFish(prevFish => [...prevFish, fish]);
    
    // 切换到鱼缸视图
    setCurrentView('tank');
  };
  
  // 重置并开始绘制新鱼
  const handleDrawNewFish = () => {
    setCurrentView('drawing');
  };
  
  // 页面标题和导航
  const renderHeader = () => (
    <header className="app-header">
      <h1 className="app-title">🎨 涂鸦画鱼</h1>
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
