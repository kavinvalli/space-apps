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
      data-title="Historical view"
      data-intro="This allows you to do xyz"
      data-step="2"
      data-position="left"
    >
      <div style={{ background: '#1a506b', padding: '4px', color: '#fff' }}>
        {number}
      </div>
      <input
        data-intro="You can drag this and see the changes happen to ISS model"
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
