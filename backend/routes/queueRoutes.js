const express = require("express");
const { 
  addToQueue,
  getQueue,
  deleteQueue,
  notifyQueue,
  notifyCustomer,
  handleIncomingSms, 
  searchAndFilterQueue, 
} = require("../controllers/queueController");
const getDatabaseConnection = require("../dbConnections"); // 动态数据库连接
const { getQueueModel} = require("../models/Queue"); // 动态加载模型



const router = express.Router();

// 添加到队列（基于 restaurantId）
router.post("/:restaurantId/queue", addToQueue);

// 获取队列（基于 restaurantId）
router.get("/:restaurantId/queue", getQueue);


// 获取单个队列条目（基于 queueNumber 和 restaurantId）
router.get("/:restaurantId/queue/:queueNumber", async (req, res) => {
  const { restaurantId, queueNumber } = req.params;
  try {
    const connection = getDatabaseConnection(restaurantId); // 获取动态数据库连接
    const Queue = getQueueModel(connection); // 动态加载模型
    const queueData = await Queue.findOne({ queueNumber });

    if (!queueData) {
      return res.status(404).json({ error: "Queue not found." });
    }
    res.json(queueData);
  } catch (error) {
    console.error("Error fetching queue data:", error);
    res.status(500).json({ error: "Failed to fetch queue data." });
  }
});

// 删除队列条目（基于 restaurantId 和条目 ID）
router.delete("/:restaurantId/queue/:id", deleteQueue);

// 标记为已通知（基于 restaurantId 和条目 ID）
router.patch("/:restaurantId/queue/:id", notifyQueue);

// 通知客户（基于 restaurantId 和条目 ID）
router.patch("/:restaurantId/queue/:id/notify", notifyCustomer);

// Twilio Webhook: Handle incoming SMS
router.post("/queue/sms", handleIncomingSms);

// 搜索和过滤队列（基于 restaurantId）
router.get("/:restaurantId/queue/search", searchAndFilterQueue);

router.get("/:restaurantId/queue", async (req, res) => {
  const { restaurantId } = req.params;
  const { name, queueNumber } = req.query; // 获取查询参数

  try {
    const connection = getQueueDatabaseConnection(restaurantId); // 获取数据库连接
    if (!connection) {
      console.error("Failed to get database connection for restaurant:", restaurantId);
      return res.status(500).json({ error: "Database connection error." });
    }

    const Queue = getQueueModel(connection);
    if (!Queue) {
      console.error("Failed to get Queue model for restaurant:", restaurantId);
      return res.status(500).json({ error: "Queue model error." });
    }

    // 构造查询条件
    const query = { restaurantId }; // 默认包含 restaurantId
    if (name) {
      query.name = { $regex: name.trim(), $options: "i" }; // 去掉多余空格并模糊匹配
    }
    if (queueNumber) {
      query.queueNumber = queueNumber; // 精确匹配 queueNumber
    }

    console.log("Restaurant ID:", restaurantId); // 打印餐厅 ID
    console.log("Query parameters:", { name, queueNumber }); // 打印查询参数
    console.log("Constructed query:", query); // 打印构造的查询条件

    // 查询数据库
    const queue = await Queue.find(query).sort({ createdAt: 1, _id: 1 });

    if (!queue || queue.length === 0) {
      console.log("No matching queue data found for query:", query);
      return res.json({ success: true, queue: [] }); // 返回空队列
    }

    res.json({ success: true, queue }); // 返回查询结果
  } catch (error) {
    console.error("Error fetching queue data:", error);
    res.status(500).json({ error: "Failed to fetch queue data." });
  }
});




module.exports = router;
