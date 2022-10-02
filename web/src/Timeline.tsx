import { useState } from "react";

export default function Timeline({
  callback,
}: {
  callback: (i: number) => void;
}) {
  const [number, setNumber] = useState<number>(2022);
  return (
    <div className="timeline">
      <div style={{ background: "#1a506b", padding: "4px", color: "#fff" }}>
        {number}
      </div>
      <input
        type="range"
        min="1984"
        max={new Date().getFullYear()}
        defaultValue="2022"
        onChange={(e) => {
          callback(parseInt(e.target.value));
          setNumber(parseInt(e.target.value));
        }}
      />
    </div>
  );
}
