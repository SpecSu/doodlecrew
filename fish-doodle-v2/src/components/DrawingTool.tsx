import React, { useRef, useState, useEffect } from 'react';
import type { Point, DrawingToolProps, PathSegment } from '../types';
import './DrawingTool.css';

const DrawingTool: React.FC<DrawingToolProps> = ({
  onDrawingComplete,
  onViewFishTank,
  color,
  onColorChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]); // 包含颜色和粗细信息的路径段数组
  const [currentPath, setCurrentPath] = useState<Point[]>([]); // 当前正在绘制的路径
  const [lineWidth, setLineWidth] = useState<number>(3); // 当前选择的笔触粗细
  const [lineWidths] = useState<number[]>([2, 3, 5, 8]); // 可用的笔触粗细选项
  
  // 颜色选项
  const colors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#45B7D1', // 蓝色
    '#96CEB4', // 绿色
    '#FFEAA7', // 黄色
    '#DDA0DD', // 紫色
    '#FFA07A'  // 橙色
  ];
  
  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // 设置画布大小
    canvas.width = 400;
    canvas.height = 300;
    
    // 清空画布并设置背景色
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#2B3A72';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);
  
  // 合并所有路径用于绘制
    const allSegments = [...pathSegments];
    if (currentPath.length > 0) {
      allSegments.push({ points: currentPath, color, lineWidth });
    }
    
    // 绘制所有路径
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // 清空画布并设置背景色
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#2B3A72';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // 检查是否有任何路径
      const hasAnyPath = allSegments.some(s => s.points.length > 0);
      
      // 绘制所有已完成的路径和当前路径
      if (hasAnyPath) {
        allSegments.forEach(segment => {
          if (segment.points.length > 0) {
            context.beginPath();
            context.moveTo(segment.points[0].x, segment.points[0].y);
            
            for (let i = 1; i < segment.points.length; i++) {
              context.lineTo(segment.points[i].x, segment.points[i].y);
            }
            
            context.strokeStyle = segment.color;
            context.lineWidth = segment.lineWidth;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.stroke();
          }
        });
      }
      
      // 绘制提示文本
      if (!hasAnyPath) {
        context.fillStyle = '#999';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('请在画布上绘制一条鱼', canvas.width / 2, canvas.height / 2);
      }
    }, [allSegments, color, lineWidth]);
  
  // 获取触摸点位置
  const getTouchPosition = (e: React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    return { x, y };
  };

  // 处理点触事件（鼠标或触摸）
  const handlePointerDown = (x: number, y: number) => {
    setIsDrawing(true);
    setCurrentPath([{ x, y }]); // 开始一条新路径
  };

  // 处理点移动事件（鼠标或触摸）
  const handlePointerMove = (x: number, y: number) => {
    if (!isDrawing) return;
    setCurrentPath(prevPath => [...prevPath, { x, y }]);
  };

  // 处理点抬起事件（鼠标或触摸）
  const handlePointerUp = () => {
    if (currentPath.length > 0) {
      setPathSegments(prevSegments => [...prevSegments, { points: currentPath, color, lineWidth }]); // 保存当前路径到已完成路径段数组
      setCurrentPath([]); // 清空当前路径，准备绘制新路径
    }
    setIsDrawing(false);
  };

  // 鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    handlePointerDown(x, y);
  };
  
  // 鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    handlePointerMove(x, y);
  };
  
  // 鼠标抬起事件
  const handleMouseUp = () => {
    handlePointerUp();
  };
  
  // 鼠标离开事件
  const handleMouseLeave = () => {
    setIsDrawing(false);
  };

  // 触摸开始事件
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // 防止触发鼠标事件
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getTouchPosition(e, canvas);
    handlePointerDown(x, y);
  };

  // 触摸移动事件
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // 防止页面滚动
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;
    
    const { x, y } = getTouchPosition(e, canvas);
    handlePointerMove(x, y);
  };

  // 触摸结束事件
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handlePointerUp();
  };

  // 触摸取消事件
  const handleTouchCancel = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };
  
  // 清除画布
    const handleClear = () => {
      setPathSegments([]);
      setCurrentPath([]);
    };
  
  return (
    <div className="drawing-tool">
      <h2>绘制你的鱼</h2>
      
      {/* 样式控制区域 */}
      <div className="style-controls">
        <h3 style={{ margin: 0, textAlign: 'center', color: '#333', fontSize: '16px' }}>选择颜色</h3>
        <div className="color-picker">
          {colors.map(c => (
            <button
              key={c}
              className={`color-option ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
              aria-label={`选择${c}颜色`}
            />
          ))}
        </div>
        
        <h3 style={{ margin: 0, textAlign: 'center', color: '#333', fontSize: '16px' }}>选择笔触粗细</h3>
        <div className="line-width-picker">
          {lineWidths.map(w => (
            <button
              key={w}
              className={`line-width-option ${lineWidth === w ? 'selected' : ''}`}
              onClick={() => setLineWidth(w)}
              aria-label={`选择${w}px笔触`}
            >
              {w}px
            </button>
          ))}
        </div>
      </div>
      
      {/* 画布 */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="drawing-canvas"
        style={{ touchAction: 'none' }} // 防止浏览器默认触摸行为
      />
      
      {/* 控制按钮 */}
      <div className="drawing-controls">
        <button 
          onClick={handleClear} 
          className="control-button"
          disabled={pathSegments.length === 0 && currentPath.length === 0}
        >
          清除
        </button>
        <button 
          onClick={onViewFishTank} 
          className="control-button tank-button"
        >
          查看鱼缸
        </button>
        <button 
          onClick={() => {
            // 准备所有路径段（包括已完成的路径段和当前路径段）
            const allSegments = [...pathSegments];
            if (currentPath.length > 0) {
              allSegments.push({ points: currentPath, color, lineWidth });
            }
            
            // 过滤掉空路径段
            const validSegments = allSegments.filter(s => s.points.length > 0);
            
            if (validSegments.length === 0) return;
            
            // 合并所有点用于计算鱼的大小
            const allPoints: Point[] = [];
            validSegments.forEach(s => allPoints.push(...s.points));
            
            // 计算鱼的边界框
            const minX = Math.min(...allPoints.map(p => p.x));
            const maxX = Math.max(...allPoints.map(p => p.x));
            const minY = Math.min(...allPoints.map(p => p.y));
            const maxY = Math.max(...allPoints.map(p => p.y));
            
            // 计算鱼的大小（用于缩放）
            const width = maxX - minX;
            const height = maxY - minY;
            const size = Math.sqrt(width * width + height * height);
            const scale = Math.min(1, 200 / size); // 限制最大尺寸
            
            // 计算鱼的中心点（用于归一化）
            const centerX = minX + width / 2;
            const centerY = minY + height / 2;
            
            // 归一化路径点，使鱼的中心点位于原点
            const normalizedPoints = validSegments.map(segment => ({
              ...segment,
              points: segment.points.map(p => ({
                x: p.x - centerX,
                y: p.y - centerY
              }))
            }));
            
            // 随机生成初始位置和速度
            const randomX = Math.random() * 800 + 100; // 更合理的初始位置范围
            const randomY = Math.random() * 400 + 100;
            const randomSpeed = 0.05 + Math.random() * 0.1; // 使用与FishTank中一致的速度范围
            const randomAngle = Math.random() * Math.PI * 2;
            
            const newFish = {
              id: Date.now().toString(),
              path: allPoints, // 用于向后兼容的单条路径
              paths: normalizedPoints.map(s => s.points), // 用于向后兼容的多条独立路径
              pathSegments: normalizedPoints, // 包含颜色和粗细信息的归一化路径段
              color: color, // 用于向后兼容的整体颜色
              x: randomX,
              y: randomY,
              rotation: randomAngle,
              scale: scale,
              speedX: Math.cos(randomAngle) * randomSpeed,
              speedY: Math.sin(randomAngle) * (randomSpeed * 0.5) // 垂直方向速度较慢
            };
            
            onDrawingComplete(newFish);
          }}
          className="control-button submit-button"
          disabled={(pathSegments.length === 0 || pathSegments.every((s: PathSegment) => s.points.length < 1)) && currentPath.length < 3}
        >
          放生这条鱼
        </button>
      </div>
    </div>
  );
};

export default DrawingTool;