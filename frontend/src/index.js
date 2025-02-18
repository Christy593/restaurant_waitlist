import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; // 引入主应用组件
import "./styles/main.css";



// 渲染主组件到页面上的 #root 容器中
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
