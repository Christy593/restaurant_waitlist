import React, { useEffect, useState } from "react";

const QueueList = () => {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);

  // 获取队列数据
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/queue");
        const data = await response.json();
        if (response.ok) {
          setQueue(data);
        } else {
          setError("Failed to fetch queue data.");
        }
      } catch (err) {
        setError("Error connecting to the server.");
      }
    };

    fetchQueue();
  }, []);

  return (
    <div className="container">
      <h2>Current Queue</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && queue.length === 0 && <p>No one is currently in the queue.</p>}
      {queue.length > 0 && (
        <div
          style={{
            maxHeight: "300px", // 设置最大高度
            overflowY: "auto", // 启用垂直滚动条
            border: "1px solid #ddd", // 边框
            borderRadius: "5px", // 圆角
            padding: "10px", // 内边距
            backgroundColor: "#f9f9f9", // 背景色
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {queue.map((entry) => (
              <li
                key={entry._id}
                style={{
                  padding: "10px",
                  margin: "10px 0",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                <strong>{entry.name}</strong> - Party Size: {entry.partySize}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QueueList;
