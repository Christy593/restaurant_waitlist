const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const queueRoutes = require("./routes/queueRoutes");

const app = express();
const PORT = 5001;


// 中间件
app.use(cors());
app.use(bodyParser.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "API is running!" });
});

app.use("/api", queueRoutes);

// Webhook for Twilio (Ensure it works!)
app.post("/api/queue/sms", (req, res) => {
  console.log("Received Twilio Webhook:", req.body);
  res.status(200).send("Webhook received.");
});




// 测试根路径
app.get("/", (req, res) => {
  res.send("Server is running!");
});


const listEndpoints = require("express-list-endpoints"); 
console.log("🔍 当前 Express 服务器注册的所有路由:");
console.table(listEndpoints(app));


// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // 使用模板字符串
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});