import React from "react";
import { useParams } from "react-router-dom";

const StaffPage = () => {
  const { restaurantId } = useParams();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to {restaurantId} Staff Page</h1>
      <p>This is the staff-only portal for {restaurantId}.</p>
    </div>
  );
};

export default StaffPage;
