import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QueueForm from "./components/QueueForm";
import RestaurantSelector from "./components/RestaurantSelector";
import StaffPage from "./pages/StaffPage";

const App = () => {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);

  // 获取当前队列数据
  const fetchQueue = async (restaurantId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/${restaurantId}/queue`);
      const data = await response.json();
      if (response.ok) {
        console.log("Queue data fetched successfully:", data);
        setQueue(data);
        setError(null);
      } else {
        setError("Failed to fetch queue data.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    }
  };

  return (
    <Router>
      <Routes>
        {/* 餐厅选择页面 */}
        <Route path="/" element={<RestaurantSelector />} />


        {/* 加入队列和查看队列页面 */}
        <Route
          path="/customer/:restaurantId"
          element={
            <QueueForm
              onAddToQueue={fetchQueue}
              queue={queue}
              error={error}
            />
          }
        />

         {/* 员工端页面 */}
         <Route path="/staff/:restaurantId" element={<StaffPage />} />
      </Routes>
    </Router>
  );
};

export default App;

