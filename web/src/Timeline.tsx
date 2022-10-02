import { useState } from 'react';

export default function Timeline({
  callback,
}: {
  callback: (i: number) => void;
}) {
  const [number, setNumber] = useState<number>(2022);
  return (
    <div
      className="timeline"
      data-title="Historical Timeline"
      data-intro="Show different models fo the ISS over the course of the years"
      data-step="2"
      data-position="left"
    >
      <div style={{ background: '#1a506b', padding: '4px', color: '#fff' }}>
        {number}
      </div>
      <input
        data-intro="Sliding this switches the ISS model and shows you it's past structures"
        data-disable-interaction="false"
        type="range"
        min="1984"
        data-step="3"
        max={new Date().getFullYear()}
        defaultValue="2022"
        onChange={e => {
          callback(parseInt(e.target.value));
          setNumber(parseInt(e.target.value));
        }}
      />
    </div>
  );
}
