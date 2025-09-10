// src/components/Stage.tsx

import React from "react";

const Stage: React.FC<{ icon: string; label: string; time: string; isCompleted: boolean; isActive: boolean; color: string }> = ({
  icon,
  label,
  time,
  isCompleted,
  isActive,
  color,
}) => {
  const isPending = !isCompleted && !isActive;

  const bgColor = isCompleted
    ? (color === "success" ? "#d4edda" : color === "info" ? "#d1ecf1" : color === "warning" ? "#fff3cd" : "#e2e3e5")
    : isActive
      ? (color === "success" ? "#d4edda" : color === "info" ? "#d1ecf1" : color === "warning" ? "#fff3cd" : "#e2e3e5")
      : "#e9ecef";

  const iconColor = isCompleted
    ? (color === "success" ? "#155724" : color === "info" ? "#0c5460" : color === "warning" ? "#664d03" : "#6c757d")
    : isActive
      ? (color === "success" ? "#155724" : color === "info" ? "#0c5460" : color === "warning" ? "#664d03" : "#6c757d")
      : "#6c757d";

  const renderContent = () => {
    if (isActive) {
      // แสดงเฉพาะ Spinner สำหรับ Stage ที่กำลังโหลด
      return (
        <div className={`spinner-border`} role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.25rem', color: iconColor }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      );
    }
    // แสดงไอคอนปกติสำหรับ Stage ที่เสร็จแล้ว
    return <i className={`bi ${icon} fs-5`}></i>;
  };

  return (
    <div className="d-flex flex-column align-items-center text-center">
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm p-3`}
        style={{
          width: "3rem",
          height: "3rem",
          backgroundColor: bgColor,
        }}
      >
        {renderContent()}
      </div>
      {/* แสดง Label และ Time เฉพาะ Stage ที่เสร็จแล้วและ Stage ที่กำลังโหลด */}
      {isActive ? (
          // ถ้ากำลังโหลด ให้แสดงเฉพาะ Label แต่ไม่แสดง Time
          <div className="fw-bold text-dark">{label}</div>
      ) : (
          <>
            <div className="fw-bold text-dark">{label}</div>
            <div className="text-muted small">{time}</div>
          </>
      )}
    </div>
  );
};

export default Stage;