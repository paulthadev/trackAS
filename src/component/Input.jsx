/* eslint-disable react/prop-types */
const Input = ({ label, type, placeholder, onChange }) => {
  return (
    <div className="form-control">
      <label htmlFor="" className="label">
        <span className="label-text font-bold text-sm text-[#1E1E1E]">
          {label}
        </span>
      </label>
      <input
        type={type}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="input bg-white w-[100%]  text-black border-black border-[1px] focus:border-black  rounded-[0.375rem]"
      />
    </div>
  );
};
export default Input;
