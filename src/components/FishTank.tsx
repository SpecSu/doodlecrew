import React, { useRef, useState, useEffect } from 'react';
import type { Fish, FishTankProps, PathSegment } from '../types';
import './FishTank.css';

// 简化的鱼行为参数 - 不使用角度和旋转
interface SimpleSwimBehavior {
  x: number;           // 当前x位置
  y: number;           // 当前y位置
  directionX: number;  // X方向速度分量
  directionY: number;  // Y方向速度分量
  baseSpeed: number;   // 基础速度(像素/帧)
  nextDirectionChange: number; // 下次改变方向的时间
  directionChangeInterval: number; // 方向改变的时间间隔(ms)
}

// 增强型鱼对象，包含原始Fish属性和行为控制
interface EnhancedFish extends Fish {
  behavior: SimpleSwimBehavior;
}

const FishTank: React.FC<FishTankProps> = ({ fish }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [enhancedFish, setEnhancedFish] = useState<EnhancedFish[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // 初始化鱼的行为属性
  useEffect(() => {
    console.log('Received fish data:', fish);
    if (fish && fish.length > 0) {
      const initializedFish = fish.map((f: Fish) => {
        return {
          ...f,
          behavior: initializeFishBehavior(f)
        };
      });
      console.log('Initialized fish with behavior:', initializedFish);
      setEnhancedFish(initializedFish);
    }
  }, [fish]);

  // 初始化鱼的基本游动行为
  const initializeFishBehavior = (fish: Fish): SimpleSwimBehavior => {
    // 设置基础速度 (1-2像素/帧)
    const baseSpeed = 1 + Math.random();
    
    // 随机初始方向
    const angle = Math.random() * Math.PI * 2;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    
    // 随机方向改变间隔 (3-8秒)
    const directionChangeInterval = 3000 + Math.random() * 5000;
    const nextDirectionChange = Date.now() + directionChangeInterval;
    
    return {
      x: fish.x,
      y: fish.y,
      directionX,
      directionY,
      baseSpeed,
      nextDirectionChange,
      directionChangeInterval
    };
  };

  // 生成新的游动方向
  const generateNewDirection = (currentX: number, currentY: number): { x: number; y: number } => {
    // 轻微改变方向，而不是完全随机
    const angleChange = (Math.random() - 0.5) * 0.8; // 最大改变约45度
    const currentAngle = Math.atan2(currentY, currentX);
    const newAngle = currentAngle + angleChange;
    
    return {
      x: Math.cos(newAngle),
      y: Math.sin(newAngle)
    };
  };

  // 处理边界碰撞
  const handleBoundaryCollision = (fish: EnhancedFish, canvasWidth: number, canvasHeight: number): void => {
    const margin = 50; // 边界缓冲区
    const { behavior } = fish;
    
    // 左右边界碰撞
    if (behavior.x <= margin && behavior.directionX < 0) {
      behavior.directionX = Math.abs(behavior.directionX);
    } else if (behavior.x >= canvasWidth - margin && behavior.directionX > 0) {
      behavior.directionX = -Math.abs(behavior.directionX);
    }
    
    // 上下边界碰撞
    if (behavior.y <= margin && behavior.directionY < 0) {
      behavior.directionY = Math.abs(behavior.directionY);
    } else if (behavior.y >= canvasHeight - margin && behavior.directionY > 0) {
      behavior.directionY = -Math.abs(behavior.directionY);
    }
  };

  // 更新鱼的位置和行为
  const updateFish = (fish: EnhancedFish, deltaTime: number, canvasWidth: number, canvasHeight: number): void => {
    const { behavior } = fish;
    
    // 时间平滑处理
    const timeFactor = deltaTime / 16.67; // 基于60fps的时间因子
    const effectiveSpeed = behavior.baseSpeed * timeFactor;
    
    // 更新位置
    behavior.x += behavior.directionX * effectiveSpeed;
    behavior.y += behavior.directionY * effectiveSpeed;
    
    // 边界碰撞检测
    handleBoundaryCollision(fish, canvasWidth, canvasHeight);
    
    // 检查是否需要改变方向
    const currentTime = Date.now();
    if (currentTime >= behavior.nextDirectionChange) {
      const newDirection = generateNewDirection(behavior.directionX, behavior.directionY);
      behavior.directionX = newDirection.x;
      behavior.directionY = newDirection.y;
      
      // 设置下次改变方向的时间
      behavior.nextDirectionChange = currentTime + behavior.directionChangeInterval;
    }
    
    // 更新鱼的位置信息
    fish.x = behavior.x;
    fish.y = behavior.y;
  };

  // 绘制鱼的路径
  const drawFish = (ctx: CanvasRenderingContext2D, fish: EnhancedFish): void => {
    const { pathSegments, scale } = fish;
    
    // 保存当前上下文状态
    ctx.save();
    
    // 移动到鱼的位置
    ctx.translate(fish.x, fish.y);
    
    // 应用缩放
    ctx.scale(scale, scale);
    
    // 应用旋转 - 调整角度使得鱼的头部朝向移动方向
    // 添加Math.PI确保鱼的头部朝向前方而不是尾部
    const angle = Math.atan2(fish.behavior.directionY, fish.behavior.directionX) + Math.PI;
    ctx.rotate(angle);
    
    // 绘制每个路径段
    pathSegments.forEach((segment: PathSegment) => {
      ctx.beginPath();
      
      // 设置样式
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = segment.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 绘制路径
      const points = segment.points;
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        // 闭合路径
        ctx.closePath();
        
        ctx.stroke();
      }
    });
    
    // 恢复上下文状态
    ctx.restore();
  };

  // 动画循环
  const animate = (currentTime: number) => {
    const canvas = canvasRef.current;
    console.log('Animation frame, canvas:', canvas, 'enhancedFish count:', enhancedFish.length);
    if (!canvas || enhancedFish.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;
    
    // 计算实际显示尺寸（考虑设备像素比后的调整尺寸）
    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;
    
    // 计算时间差用于平滑动画
    const deltaTime = currentTime - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTime;
    
    // 清除画布
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // 更新所有鱼的状态（创建新对象，而不是直接修改）
    const updatedFish = enhancedFish.map(fish => {
      const newFish = { ...fish };
      updateFish(newFish, deltaTime, displayWidth, displayHeight);
      return newFish;
    });
    
    // 更新状态
    setEnhancedFish(updatedFish);
    
    // 绘制所有鱼
    updatedFish.forEach(fish => {
      drawFish(ctx, fish);
    });
    
    // 继续动画循环
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // 开始和停止动画
  useEffect(() => {
    if (enhancedFish.length > 0) {
      lastUpdateTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enhancedFish]);

  // 响应式画布大小
  useEffect(() => {
    const handleResize = () => {
      console.log('Resizing canvas');
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          // 获取容器尺寸
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // 获取设备像素比，确保在高分辨率屏幕上显示清晰
          const dpr = window.devicePixelRatio || 1;
          
          // 保持画布的实际显示大小与容器相同
          canvas.style.width = `${containerWidth}px`;
          canvas.style.height = `${containerHeight}px`;
          
          // 设置画布的内在绘图大小，考虑设备像素比
          canvas.width = containerWidth * dpr;
          canvas.height = containerHeight * dpr;
          
          // 获取画布上下文并应用缩放，确保绘图使用正确的比例
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(dpr, dpr);
          }
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fish-tank">
      <canvas
        ref={canvasRef}
        className="tank-canvas"
      />
    </div>
  );
};

export default FishTank;