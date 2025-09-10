import React from "react";

const Badge: React.FC<{ color: "success" | "info" | "warning" | "danger" | "secondary"; children: React.ReactNode }> = ({
  color,
  children,
}) => {
  return <span className={`badge text-bg-${color}`}>{children}</span>;
};

export default Badge;