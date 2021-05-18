import React from "react";

function SelectInterval(props) {
  let { onIntervalSelect, interval } = props;
  let intervals = [
    { label: "5s", value: 5 },
    { label: "10s", value: 10 },
    { label: "20s", value: 20 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "2m", value: 120 },
    { label: "5m", value: 300 },
  ];

  let renderInterval = (interval) => (
    <option value={interval.value}>{interval.label}</option>
  );

  return (
    <p>
      <label>Check slots every </label>
      {
        <select value={interval} onChange={onIntervalSelect}>
          {intervals.map((interval) => renderInterval(interval))}
        </select>
      }
    </p>
  );
}

export default SelectInterval;
