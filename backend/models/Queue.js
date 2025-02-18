const mongoose = require("mongoose");

// Queue Schema
const queueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  partySize: { type: Number, required: true },
  queueNumber: { type: String, required: true, unique: true },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  optedIn: { type: Boolean, default: true },
  minWaitTime: { type: Number, default: 0 }, // 最小等待时间
  maxWaitTime: { type: Number, default: 0 }, // 最大等待时间
});


// 动态加载 Queue 模型
const getQueueModel = (connection) => {
  return connection.model("Queue", queueSchema, "queues");
};

// ✅ Opt-Out Schema (New Table for STOP messages)
const optOutSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  optedOutAt: { type: Date, default: Date.now },
});

// Dynamic OptOut Model
const getOptOutModel = (connection) => {
  return connection.model("OptOut", optOutSchema, "optouts");
};

// Table Config Schema
const tableConfigSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, unique: true }, // 餐厅ID
  totalLarge: { type: Number, default: 10 }, // 大桌子数量
  totalMedium: { type: Number, default: 5 }, // 中桌子数量
  totalSmall: { type: Number, default: 4}, // 小桌子数量
  averageTimeLarge: { type: Number, default: 90 }, // 大桌平均时间（分钟）
  averageTimeMedium: { type: Number, default: 60 }, // 中桌平均时间（分钟）
  averageTimeSmall: { type: Number, default: 30 }, // 小桌平均时间（分钟）
});

// 静态绑定 TableConfig 模型
const TableConfig = mongoose.model("TableConfig", tableConfigSchema, "tableconfigs");

// 导出模型和函数
module.exports = { getQueueModel,  getOptOutModel, TableConfig };


