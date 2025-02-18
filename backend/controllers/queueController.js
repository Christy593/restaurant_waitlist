require("dotenv").config();

const { getDatabaseConnection } = require("../dbConnections");

const { getQueueModel, getOptOutModel} = require("../models/Queue"); 
const twilio = require("twilio");


const { TableConfig } = require("../models/Queue");

// 替换为你的 Twilio 账户信息
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);


// 添加队列
const addToQueue = async (req, res) => {
  const { restaurantId } = req.params;
  const { name, phone, partySize } = req.body;

  // 🛠 确保 optedIn 存在，默认设置为 true
  const optedIn = req.body.optedIn !== undefined ? req.body.optedIn : true;


  if (!restaurantId || !name || !phone || partySize === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (optedIn !== true) {
    return res.status(400).json({ error: "You must agree to receive SMS notifications." });
  }

  try {
    // 动态加载 Queue 模型
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection);


    // 检查重复电话号码
    const existingEntry = await Queue.findOne({ phone });
    if (existingEntry) {
      return res.status(400).json({ error: "Phone number already exists in the queue." });
    }

    // 生成队列号
    const lastQueue = await Queue.findOne().sort({ queueNumber: -1 }).exec();
    const nextQueueNumber = lastQueue ? parseInt(lastQueue.queueNumber.substring(1)) + 1 : 1;
    const queueNumber = `A${String(nextQueueNumber).padStart(3, "0")}`;

    // 存储到数据库，opt-in 默认为 true
    const newQueue = new Queue({ name, phone, partySize, queueNumber, optedIn: true });
    await newQueue.save();

   // 发送 opt-in 确认短信，包含 queueNumber
    await client.messages.create({
      body: `Welcome to the waitlist, ${name}! Your queue number is ${queueNumber}. We will notify you when your table is ready. Reply STOP to opt out.`,
      from: twilioPhone,
      to: phone.startsWith("+1") ? phone : `+1${phone}`,
    });


    // 获取当前队列数据
    const queue = await Queue.find().sort({ createdAt: 1 });
    const waitingGroups = queue.map((item) => [item.partySize, item.queueNumber]);

    res.status(201).json({
      queueNumber,
      waitingGroups
    });
  } catch (error) {
    console.error("Error saving queue data:", error);
    res.status(500).json({ error: "Failed to add to queue." });
  }
};

// 获取队列
const getQueue = async (req, res) => {
  const { restaurantId } = req.params;
  const { name, queueNumber } = req.query;
  console.log("Received restaurantId from frontend:", restaurantId);

  try {
    // 动态加载 Queue 模型
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection);

    const query = {};
    if (name) {
      query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive name search
    }
    if (queueNumber) {
      query.queueNumber = queueNumber;
    }

    // 获取队列数据
    const queue = await Queue.find().sort({ createdAt: 1 });
    if (queue.length === 0) {
      return res.status(200).json({
        success: true,
        queue: queue.map((item) => ({
          queueNumber: item.queueNumber,
          name: item.name,
          partySize: item.partySize,
          optedIn: item.optedIn || false, // 确保 optedIn 字段存在
          minWaitTime: item.minWaitTime, // 从数据库中返回最小等待时间
          maxWaitTime: item.maxWaitTime, // 从数据库中返回最大等待时间
        })),
      });
    }

    res.status(200).json({
      success: true,
      queue,
    });
  } catch (error) {
    console.error("Error fetching queue data:", error);
    res.status(500).json({ error: "Failed to fetch queue data." });
  }
};


// 删除队列
const deleteQueue = async (req, res) => {
  const { restaurantId, id } = req.params;

  if (!restaurantId || !id) {
    return res.status(400).json({ error: "Restaurant ID and item ID are required." });
  }

  try {
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection); // 动态绑定模型

    const result = await Queue.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Queue item not found." });
    }


    res.status(204).send();
  } catch (error) {
    console.error("Error deleting queue item:", error);
    res.status(500).json({ error: "Failed to delete queue item." });
  }
};

// 通知队列
const notifyQueue = async (req, res) => {
  const { restaurantId, id } = req.params;

  if (!restaurantId || !id) {
    return res.status(400).json({ error: "Restaurant ID and item ID are required." });
  }

  try {
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection); // 动态绑定模型

    const queueItem = await Queue.findById(id);
    if (!queueItem) {
      return res.status(404).json({ error: "Queue item not found." });
    }

    queueItem.notified = true;
    await queueItem.save();

    res.status(200).json({ message: "Customer has been notified.", queueItem });
  } catch (error) {
    console.error("Error updating queue item:", error);
    res.status(500).json({ error: "Failed to update notification status." });
  }
};

const notifyCustomer = async (req, res) => {
  const { restaurantId, id } = req.params;

  if (!restaurantId || !id) {
    return res.status(400).json({ error: "Restaurant ID and item ID are required." });
  }

  try {
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection); // 动态绑定模型
    const OptOut = getOptOutModel(connection);

    // 查找队列中的条目
    const queueItem = await Queue.findById(id);
    if (!queueItem) {
      return res.status(404).json({ error: "Queue item not found." });
    }

    // 检查用户是否在退订名单
    const isOptedOut = await OptOut.findOne({ phone: queueItem.phone });
    if (isOptedOut) {
      return res.status(400).json({ error: "Customer has opted out of SMS notifications." });
    }

    // 确保用户已同意 opt-in
    if (!queueItem.optedIn) {
      return res.status(400).json({ error: "Customer has not opted in for SMS notifications." });
    }

    await client.messages.create({
      body: `Hello ${queueItem.name}, your table is ready! Please check in within 5 minutes. Reply STOP to opt out.`,
      from: twilioPhone,
      to: queueItem.phone.startsWith("+1") ? queueItem.phone : `+1${queueItem.phone}`,
    });
    // 更新通知状态
    queueItem.notified = true;
    await queueItem.save();


    res.json({ message: "Customer notified successfully", queueItem });
  } catch (error) {
    console.error("Error notifying customer:", error);
    res.status(500).json({ error: "Failed to notify customer." });
  }
};
const handleIncomingSms = async (req, res) => {
  const fromNumber = req.body.From;
  const messageBody = req.body.Body.trim().toLowerCase();

  try {
    const connection = getDatabaseConnection();
    const OptOut = getOptOutModel(connection);

    if (messageBody === "stop") {
      await OptOut.findOneAndUpdate(
        { phone: fromNumber },
        { phone: fromNumber, optedOutAt: new Date() },
        { upsert: true, new: true }
      );

      await client.messages.create({
        body: "You have unsubscribed from waitlist notifications. Reply START to re-subscribe.",
        from: twilioPhone,
        to: fromNumber,
      });

      console.log(`User ${fromNumber} opted out.`);
      return res.status(200).send("Opt-out successful.");
    }

    if (messageBody === "start") {
      await OptOut.findOneAndDelete({ phone: fromNumber });

      await client.messages.create({
        body: "You have re-subscribed to waitlist notifications. We'll notify you when your table is ready.",
        from: twilioPhone,
        to: fromNumber,
      });

      console.log(`User ${fromNumber} opted back in.`);
      return res.status(200).send("Opt-in successful.");
    }

    console.log(`Received SMS from ${fromNumber}: ${messageBody}`);
    res.status(200).send("Message received.");
  } catch (error) {
    console.error("Error processing incoming SMS:", error);
    res.status(500).json({ error: "Failed to process message." });
  }
};



// 搜索队列
const searchAndFilterQueue = async (req, res) => {
  const { restaurantId } = req.params;
  const { name, phone, queueNumber, notified } = req.query;

  if (!restaurantId) {
    return res.status(400).json({ error: "Restaurant ID is required." });
  }

  try {
    const connection = getDatabaseConnection(restaurantId);
    const Queue = getQueueModel(connection); // 动态绑定模型

    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (phone) query.phone = phone;
    if (queueNumber) query.queueNumber = queueNumber;
    if (notified !== undefined) query.notified = notified === "true";

    const queueData = await Queue.find(query);
    res.status(200).json(queueData);
  } catch (error) {
    console.error("Error fetching filtered queue data:", error);
    res.status(500).json({ error: "Failed to fetch queue data." });
  }
};



module.exports = { addToQueue, getQueue, deleteQueue, notifyQueue, notifyCustomer, handleIncomingSms, searchAndFilterQueue};