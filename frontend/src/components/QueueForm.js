import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const QueueForm = ({ onAddToQueue }) => {
  const { restaurantId } = useParams(); // 获取餐厅 ID
  const [partySize, setPartySize] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [queueNumber, setQueueNumber] = useState(null);
  const [formError, setFormError] = useState(null);
  const [queue, setQueue] = useState([]); // 队列数据

  // 获取队列数据
  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/${restaurantId}/queue`);
        const data = await response.json();

        if (data.success) {
          setQueue(data.queue); // 设置队列数据
        } else {
          setFormError(data.message || "Failed to fetch queue data.");
        }
      } catch (err) {
        setFormError("Error connecting to the server.");
      }
    };

    fetchQueueData();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setFormError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/${restaurantId}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, partySize, optedIn: true}),
      });
      const data = await response.json();

      if (response.ok) {
        setQueueNumber(data.queueNumber); // 显示队列号
        setFormError(null);
        onAddToQueue(restaurantId); // 刷新队列数据
      } else {
        setFormError(data.error || "Failed to join the queue.");
      }
    } catch (err) {
      setFormError("Error connecting to the server.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Join the Waitlist for {restaurantId}</h2>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      {queue.length === 0 && !formError && <p>No one is currently in the queue.</p>}
      
      {/* 表单部分 */}
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Your Name:
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", width: "300px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="phone" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Phone Number:
          </label>
          <input
            id="phone"
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            maxLength="10"
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, "");
              setPhone(input.slice(0, 10));
            }}
            style={{ padding: "10px", width: "300px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="partySize" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Party Size:
          </label>
          <input
            id="partySize"
            type="number"
            placeholder="Enter party size"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            style={{ padding: "10px", width: "300px" }}
          />
        </div>
        
        {/* Opt-in 声明（不需要用户勾选） */}
        <p style={{ fontSize: "14px", color: "gray" }}>
          By submitting this form, you agree to receive SMS updates regarding your waitlist status. 
          Reply STOP anytime to opt out.
        </p>
        
        <button
          type="submit"
          style={{
            padding: "10px 10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Get Queue Number
        </button>
      </form>

      {/* 队列号显示 */}
      {queueNumber && (
        <div style={{ marginTop: "20px" }}>
          <h3>Your Queue Number</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
            {queueNumber}
          </p>
          <p style={{ marginTop: "10px", fontSize: "18px", color: "green" }}>
            Thank you for joining the waitlist.
          </p>
        </div>
      )}

      {/* 当前队列 */}
      <div
        style={{
          marginTop: "30px",
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Queue Number</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Party Size</th>

            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item._id}>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{item.queueNumber}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{item.name}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{item.partySize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueForm;
