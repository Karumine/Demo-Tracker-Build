import React from "react";

const EmojiBtn: React.FC<{ label: string; active?: boolean; bg: string; onClick: () => void }> = ({
  label,
  active,
  bg,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`rounded-circle d-flex align-items-center justify-content-center border-0`}
    style={{ width: "3.5rem", height: "3.5rem", fontSize: "1.5rem", background: bg }}
  >
    {label}
  </button>
);

export default EmojiBtn;