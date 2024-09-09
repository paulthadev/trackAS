/* eslint-disable react/prop-types */
import { Map } from "iconsax-react";

const Input = ({
  label,
  type,
  placeholder,
  onChange,
  value,
  name,
  MapModal,
  defaultValue,
}) => {
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className="label-text font-bold text-sm text-[#1E1E1E]">
          {label}
        </span>
      </label>

      <div className="relative">
        {name === "lectureVenue" && (
          <Map
            variant="Bold"
            className="absolute text-black items-center inset-y-2.5 right-4 flex cursor-pointer"
            onClick={MapModal} // Trigger modal on click
          />
        )}

        <input
          name={name}
          id={name}
          type={type}
          onChange={onChange}
          value={value}
          defaultValue={defaultValue}
          required
          placeholder={placeholder}
          className="input bg-white w-[100%] text-black border-black border-[1px] focus:border-black rounded-[0.375rem] pr-12"
        />
      </div>
    </div>
  );
};

export default Input;
