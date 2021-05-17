import React from "react";

function SelectInterval(props) {
  let { onIntervalSelect, interval } = props;
  let intervals = [
    { label: "2 secs", value: 2 },
    { label: "5 secs", value: 5 },
    { label: "10 secs", value: 10 },
    { label: "20 secs", value: 20 },
    { label: "30 secs", value: 30 },
    { label: "1 mins", value: 60 },
    { label: "2 mins", value: 120 },
    { label: "5 mins", value: 300 },
  ];

  let renderInterval = (interval) => (
    <option value={interval.value}>{interval.label}</option>
  );

  return (
    <p>
      <label>Time between each requests</label>
      {
        <select value={interval} onChange={onIntervalSelect}>
          {intervals.map((interval) => renderInterval(interval))}
        </select>
      }
    </p>
  );
}

export default SelectInterval;
