import React from "react";
import { useNavigate } from "react-router-dom";

const RestaurantSelector = () => {
  const restaurants = [
    { id: "Walnut", name: "Walnut Restaurant" },
    { id: "Atlantic", name: "Atlantic Restaurant" },
    { id: "MontereyPark", name: "Monterey Park Restaurant" },
  ];

  // 定义 frontend 和 staff_frontend 的地址
  const FRONTEND_URL = "http://localhost:3000"; // frontend 运行地址
  const STAFF_FRONTEND_URL = "http://localhost:3001"; // staff_frontend 运行地址

  const navigate = useNavigate(); // React Router's navigation function

  const handleCustomerAccess = (restaurantId) => {
    navigate(`/customer/${restaurantId}`);
  };

  const handleStaffAccess = (restaurantId) => {
    window.location.href = `${STAFF_FRONTEND_URL}/staff/${restaurantId}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Select a Restaurant</h1>
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} style={{ marginBottom: "20px" }}>
          <h3>{restaurant.name}</h3>
          {/* Customer Access 按钮跳转到 frontend 的客户页面 */}
          <button
            onClick={() => handleCustomerAccess(restaurant.id)}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Customer Access
          </button>
          {/* Staff Access 按钮跳转到 staff_frontend 的员工页面 */}
          <button
            onClick={() => handleStaffAccess(restaurant.id)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Staff Access
          </button>
        </div>
      ))}
    </div>
  );
};

export default RestaurantSelector;

