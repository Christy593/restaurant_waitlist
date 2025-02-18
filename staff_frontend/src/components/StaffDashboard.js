import React from "react";
import { useParams } from "react-router-dom";
import QueueList from "./QueueList";


const StaffDashboard = () => {
  const { restaurantId } = useParams(); // Fetch restaurantId from the URL

  if (!restaurantId) {
    return <p>Error: Restaurant ID is missing. Please select a restaurant.</p>;
  }

  return (
    <div>
      <h2>Staff Dashboard for {restaurantId}</h2>
      <QueueList restaurantId={restaurantId} />

    </div>
  );
};

export default StaffDashboard;

