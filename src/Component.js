import Loader from "react-loader-spinner";

let CheckboxWithLabel = (props) => {
  let { title, onPress, id } = props;

  return (
    <label>
      <input
        type="checkbox"
        id={id}
        onChange={(event) => {
          onPress(event);
        }}
        defaultChecked
      />
      {title}
    </label>
  );
};

let Button = (props) => {
  let { onClick, label } = props;

  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
};

let LoaderContainer = () => {
  return <Loader type="Bars" color="#00BFFF" height={100} width={100} />;
};

let Label = (props) => {
  let { title } = props;

  return <label>{title}</label>;
};

let Dropdown = (props) => {
  let { value, onChange, defaultOption, data, renderOption } = props;

  return (
    <select value={value} onChange={onChange}>
      <option selected>{defaultOption}</option>
      {data.map((_data) => renderOption(_data))}
    </select>
  );
};

export { CheckboxWithLabel, Button, LoaderContainer, Label, Dropdown };
