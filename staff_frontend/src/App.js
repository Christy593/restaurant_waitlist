import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StaffDashboard from "./components/StaffDashboard";
import RestaurantSelector from "./components/RestaurantSelector";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Restaurant selector */}
        <Route path="/" element={<RestaurantSelector />} />

        {/* Staff dashboard */}
        <Route path="/staff/:restaurantId" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
