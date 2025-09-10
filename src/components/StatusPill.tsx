import React from "react";
import { Order } from "../types";

const StatusPill: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const color: Record<Order["status"], string> = {
    Delivered: "bg-success text-white",
    "Check out": "bg-warning text-dark",
    "On Delivery": "bg-danger text-white",
    "Check In": "bg-info text-dark",
  };
  return (
    <span className={`badge rounded-pill ${color[status]} py-2 px-3 fw-normal`}>{status}</span>
  );
};

export default StatusPill;