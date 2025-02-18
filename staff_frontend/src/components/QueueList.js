import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const QueueList = () => {
  const { restaurantId } = useParams(); // Get restaurantId from the URL
  const [queue, setQueue] = useState([]);
  const [searchResult, setSearchResult] = useState(null); // 存储搜索结果
  const [isSearching, setIsSearching] = useState(false); // 是否处于搜索模式

  // Fetch queue data for the specific restaurant
  const fetchQueue = async (searchParams = {}) => {
    try {
      const queryString = Object.keys(searchParams).length
        ? `?${new URLSearchParams(searchParams).toString()}`
        : "";
      const url = `http://localhost:5001/api/${restaurantId}/queue${queryString}`;
  
      console.log("Search Parameters:", searchParams); // 打印查询参数
      console.log("Fetching data from URL:", url); // 打印完整的请求 URL
  
      const response = await axios.get(url);
  
      if (response.data && response.data.success) {
        if (Object.keys(searchParams).length > 0) {
          setSearchResult(response.data.queue); // 更新搜索结果
          setIsSearching(true); // 标记为搜索模式
        } else {
          setQueue(response.data.queue); // 更新主表格数据
          setSearchResult(null); // 清空搜索结果
          setIsSearching(false); // 退出搜索模式
        }
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };
  

  // Delete a queue item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(
          `http://localhost:5001/api/${restaurantId}/queue/${id}`
        );
        fetchQueue(); // Refresh the list
      } catch (error) {
        console.error("Error deleting queue item:", error);
        alert("Failed to delete the item. Please try again.");
      }
    }
  };

  // Notify a customer
  const handleNotify = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/${restaurantId}/queue/${id}/notify`
      );
      fetchQueue(); // Refresh the list
    } catch (error) {
      console.error("Error notifying customer:", error);
      alert("Failed to notify the customer. Please try again.");
    }
  };
  
  
  
  // Fetch queue data initially
  useEffect(() => {
    if (restaurantId) {
      fetchQueue(); // Fetch initial data without search filters
    }
  }, [restaurantId]);

  return (
    <div>
      <h2>Queue List for {restaurantId}</h2>
  

      {/* 主表格 */}
      {queue.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Queue Number</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Party Size</th>
              <th>Notified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item._id}>
                <td>{item.queueNumber}</td>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.partySize}</td>
                <td>{item.notified ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => handleNotify(item._id)}
                    disabled={item.notified}
                    style={{
                      backgroundColor: item.notified ? "#ccc" : "#28a745",
                      color: "white",
                      padding: "5px 10px",
                    }}
                  >
                    Notify
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      backgroundColor: "#d9534f",
                      color: "white",
                      padding: "5px 10px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customers in the queue</p>
      )}
    </div>
  );


};

export default QueueList;