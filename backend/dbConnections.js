const mongoose = require("mongoose");

const dbConnections = {};

const mapRestaurantId = (restaurantId) => {
  const mapping = {
    Walnut: "restaurant_waitlist_Walnut",
    Atlantic: "restaurant_waitlist_Atlantic",
    MontereyPark: "restaurant_waitlist_MontereyPark",
  };
  return mapping[restaurantId] || restaurantId; // 如果未匹配，则返回原值
};

const getDatabaseConnection = (restaurantId) => {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required.");
  }

  const dbName = mapRestaurantId(restaurantId);
  console.log(`Connecting to database: ${dbName}`);

  if (dbConnections[dbName]) {
    return dbConnections[dbName];
  }

  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const connection = mongoose.createConnection(uri, {
   // useNewUrlParser: true,
    //useUnifiedTopology: true,
  });

  connection.on("connected", () => {
    console.log(`Connected to database: ${dbName}`);
  });

  connection.on("error", (err) => {
    console.error(`Database connection error for ${dbName}:`, err);
    throw new Error(`Failed to connect to database: ${dbName}`);
  });

  dbConnections[dbName] = connection;
  return connection;
};

module.exports = { getDatabaseConnection };
