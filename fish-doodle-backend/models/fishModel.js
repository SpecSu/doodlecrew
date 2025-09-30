const mongoose = require('mongoose');

// 定义点的子模式
const PointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

// 定义路径段的子模式
const PathSegmentSchema = new mongoose.Schema({
  points: { type: [PointSchema], required: true },
  color: { type: String, required: true },
  lineWidth: { type: Number, required: true }
});

// 定义鱼的主模式
const FishSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  path: { type: [PointSchema], required: true },
  paths: { type: [[PointSchema]], required: true },
  pathSegments: { type: [PathSegmentSchema], required: true },
  color: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  rotation: { type: Number, required: true },
  scale: { type: Number, required: true },
  speedX: { type: Number, required: true },
  speedY: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 添加更新时间戳中间件
FishSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Fish', FishSchema);