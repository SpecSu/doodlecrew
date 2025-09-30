// 定义点的类型
export interface Point {
  x: number;
  y: number;
}

// 定义路径段的类型，包含颜色和粗细信息
export interface PathSegment {
  points: Point[];
  color: string;
  lineWidth: number;
}

// 定义鱼的类型
export interface Fish {
  id: string;
  color: string; // 用于向后兼容的整体颜色
  path: Point[]; // 用于向后兼容的单条路径
  paths: Point[][]; // 用于向后兼容的多条独立路径
  pathSegments: PathSegment[]; // 包含颜色和粗细信息的路径段
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  scale: number;
}

// 定义绘图工具的类型
export interface DrawingToolProps {
  onDrawingComplete: (fish: Fish) => void;
  onViewFishTank?: () => void; // 可选属性
  color: string;
  onColorChange: (color: string) => void;
}

// 定义鱼缸的类型
export interface FishTankProps {
  fish: Fish[];
}