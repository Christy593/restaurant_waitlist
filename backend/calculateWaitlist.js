const {getQueueModel} = require("./models/Queue");
const getDatabaseConnection = require("./dbConnections");
const { TableConfig } = require("./models/Queue"); // Correct import for TableConfig


const calculateWaitlist = async (restaurantId) => {
  try {
    const queueConnection = getDatabaseConnection(`restaurant_waitlist_${restaurantId}`);
    const Queue = getQueueModel(queueConnection);

    const tableConfigConnection = getDatabaseConnection(`restaurant_waitlist_${restaurantId}`);
    const TableConfig = getTableConfigModel(tableConfigConnection);

    // 获取当前队列
    const queue = await Queue.find().sort({ createdAt: 1 });
    if (queue.length === 0) {
      console.log("No queue data to process.");
      return;
    }

    // 获取桌子配置
    const tableConfig = await TableConfig.findOne({ restaurantId });
    if (!tableConfig) {
      console.warn(`No table configuration found for restaurantId: ${restaurantId}`);
      return;
    }

    const { totalLarge, totalMedium, totalSmall, averageTimeLarge, averageTimeMedium, averageTimeSmall } = tableConfig;

    // 重新计算等待时间
    const results = [];
    const queueLarge = [];
    const queueMedium = [];
    const queueSmall = [];

    queue.forEach((item) => {
      const { partySize, _id } = item;
      if (partySize > 4) queueLarge.push(_id);
      else if (partySize >= 2) queueMedium.push(_id);
      else queueSmall.push(_id);
    });

    queue.forEach((item) => {
      const { partySize, _id } = item;
      let position, minWaitTime, maxWaitTime;
      if (partySize > 4) {
        position = queueLarge.indexOf(_id);
        minWaitTime = Math.floor(position / totalLarge) * averageTimeLarge;
        maxWaitTime = Math.ceil((position + 1) / totalLarge) * averageTimeLarge;
      } else if (partySize >= 2) {
        position = queueMedium.indexOf(_id);
        minWaitTime = Math.floor(position / totalMedium) * averageTimeMedium;
        maxWaitTime = Math.ceil((position + 1) / totalMedium) * averageTimeMedium;
      } else {
        position = queueSmall.indexOf(_id);
        minWaitTime = Math.floor(position / totalSmall) * averageTimeSmall;
        maxWaitTime = Math.ceil((position + 1) / totalSmall) * averageTimeSmall;
      }
      results.push({ _id, minWaitTime, maxWaitTime });
    });

    // 更新数据库
    for (const { _id, minWaitTime, maxWaitTime } of results) {
      await Queue.findByIdAndUpdate(_id, { minWaitTime, maxWaitTime });
    }

    console.log(`Waitlist updated for restaurantId: ${restaurantId}`);
  } catch (error) {
    console.error("Error calculating waitlist:", error);
  }
};

module.exports = { calculateWaitlist };

