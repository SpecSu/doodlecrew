import { useRef, useState, useEffect } from 'react';
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
  isDragging?: boolean; // 添加拖动状态
}

// 拖动状态接口
interface DragState {
  isDragging: boolean;
  fishId: string | null;
  offsetX: number;
  offsetY: number;
}

const FishTank: React.FC<FishTankProps> = ({ fish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enhancedFish, setEnhancedFish] = useState<EnhancedFish[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    fishId: null,
    offsetX: 0,
    offsetY: 0
  });

  // 检查点是否在鱼的碰撞范围内
  const isPointInFish = (fish: EnhancedFish, x: number, y: number): boolean => {
    // 简化的碰撞检测 - 使用圆形碰撞区域
    const distance = Math.sqrt(
      Math.pow(x - fish.x, 2) + Math.pow(y - fish.y, 2)
    );
    // 根据鱼的大小调整碰撞半径
    const collisionRadius = 30 * fish.scale;
    return distance < collisionRadius;
  }

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
    const canvas = canvasRef.current;
    
    // 默认位置，但会在组件挂载后调整
    let x = fish.x;
    let y = fish.y;
    
    // 如果有canvas尺寸信息，确保鱼在屏幕内初始化
    if (canvas && (x === undefined || y === undefined || x < 0 || x > canvas.width || y < 0 || y > canvas.height)) {
      x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1; // 避免靠近边缘
      y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
    }
    
    // 随机初始方向
    const angle = Math.random() * Math.PI * 2;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    
    // 随机方向改变间隔 (3-8秒)
    const directionChangeInterval = 3000 + Math.random() * 5000;
    const nextDirectionChange = Date.now() + directionChangeInterval;
    
    return {
      x,
      y,
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
    // 如果鱼正在被拖动，暂停自动移动
    if (fish.isDragging) return;

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

  // 处理鼠标按下或触摸开始事件
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取点击位置相对于画布的坐标
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 检查是否点击了鱼（从上层往下检查，确保正确的视觉层级）
    for (let i = enhancedFish.length - 1; i >= 0; i--) {
      const fish = enhancedFish[i];
      if (isPointInFish(fish, x, y)) {
        // 设置拖动状态
        setDragState({
          isDragging: true,
          fishId: fish.id,
          offsetX: x - fish.x,
          offsetY: y - fish.y
        });

        // 更新鱼的拖动状态并移到数组末尾（视觉层级顶层）
        const updatedFish = [...enhancedFish];
        updatedFish.splice(i, 1);
        updatedFish.push({
          ...fish,
          isDragging: true
        });
        setEnhancedFish(updatedFish);
        break;
      }
    }
  };

  // 处理鼠标移动或触摸移动事件
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.fishId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 防止默认行为，避免页面滚动
    e.preventDefault();

    // 获取移动位置相对于画布的坐标
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 更新被拖动鱼的位置
    setEnhancedFish(prevFish => 
      prevFish.map(fish => {
        if (fish.id === dragState.fishId) {
          return {
            ...fish,
            x: x - dragState.offsetX,
            y: y - dragState.offsetY,
            behavior: {
              ...fish.behavior,
              x: x - dragState.offsetX,
              y: y - dragState.offsetY
            }
          };
        }
        return fish;
      })
    );
  };

  // 处理鼠标抬起或触摸结束事件
  const handleEnd = () => {
    if (!dragState.isDragging || !dragState.fishId) return;

    // 重置拖动状态并更新鱼的状态
    setEnhancedFish(prevFish => 
      prevFish.map(fish => {
        if (fish.id === dragState.fishId) {
          // 生成新的随机游动方向
          const newAngle = Math.random() * Math.PI * 2;
          const newDirectionX = Math.cos(newAngle);
          const newDirectionY = Math.sin(newAngle);
          
          // 重置下次方向改变时间
          const currentTime = Date.now();
          const newDirectionChangeInterval = 3000 + Math.random() * 5000;
          
          return {
            ...fish,
            isDragging: false,
            behavior: {
              ...fish.behavior,
              directionX: newDirectionX,
              directionY: newDirectionY,
              nextDirectionChange: currentTime + newDirectionChangeInterval
            }
          };
        }
        return fish;
      })
    );

    setDragState({
      isDragging: false,
      fishId: null,
      offsetX: 0,
      offsetY: 0
    });
  };

  // 绘制鱼的路径
  const drawFish = (ctx: CanvasRenderingContext2D, fish: EnhancedFish): void => {
    const { pathSegments, scale } = fish;
    
    // 保存当前上下文状态
    ctx.save();
    
    // 移动到鱼的位置
    ctx.translate(fish.x, fish.y);
    
    // 应用缩放 - 将尺寸等比缩小50%
    const displayScale = scale * 0.5;
    ctx.scale(displayScale, displayScale);
    
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
    
    // 计算时间差用于平滑动画
    const deltaTime = currentTime - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTime;
    
    // 清除画布并设置背景色
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2B3A72';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 更新所有鱼的状态（创建新对象，而不是直接修改）
    const updatedFish = enhancedFish.map(fish => {
      const newFish = { ...fish };
      updateFish(newFish, deltaTime, canvas.width, canvas.height);
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
    // 响应式调整画布大小
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 检查是否为移动设备，并在移动端调整容器高度
    const updateMobileHeight = () => {
      const isMobile = window.innerWidth <= 480;
      const container = document.querySelector('.fish-tank-container') as HTMLElement;
      const fishTank = document.querySelector('.fish-tank') as HTMLElement;
      const appHeader = document.querySelector('.app-header') as HTMLElement;
      const appFooter = document.querySelector('.app-footer') as HTMLElement;
      
      if (isMobile && fishTank && appHeader && appFooter && container) {
        const headerHeight = appHeader.offsetHeight;
        const footerHeight = appFooter.offsetHeight;
        const containerPadding = 30; // 考虑容器内边距
        
        // 计算鱼缸的实际可用高度
        const availableHeight = window.innerHeight - headerHeight - footerHeight - containerPadding;
        
        // 应用计算出的高度
        fishTank.style.height = `${availableHeight}px`;
        container.style.height = 'auto';
        container.style.maxHeight = '100vh';
      }
    };

    updateMobileHeight();
    window.addEventListener('resize', updateMobileHeight);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', updateMobileHeight);
    };
  }, []);

  return (
    <div className="fish-tank">
      <canvas
        ref={canvasRef}
        className="tank-canvas"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
      />
    </div>
  );
};

export default FishTank;