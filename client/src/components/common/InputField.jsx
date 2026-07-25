const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className="input input-bordered w-full"
      value={value}
      onChange={onChange}
    />
  );
};

export default InputField;