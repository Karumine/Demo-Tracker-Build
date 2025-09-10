import React from "react";

const RatingDots: React.FC<{ value: number }> = ({ value }) => (
  <div className="d-flex gap-1 align-items-center">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className={`rounded-circle`}
        style={{
          width: "0.5rem",
          height: "0.5rem",
          backgroundColor: i < value ? "#343a40" : "#e9ecef",
        }}
      />
    ))}
  </div>
);

export default RatingDots;