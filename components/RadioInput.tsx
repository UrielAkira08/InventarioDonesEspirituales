
import React from 'react';

interface RadioInputProps {
  name: string;
  value: string | number;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const RadioInput: React.FC<RadioInputProps> = ({ name, value, label, checked, onChange, disabled }) => {
  return (
    <label className="flex items-center space-x-2 p-2 rounded-md hover:bg-sky-100 cursor-pointer transition-colors duration-150">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="form-radio h-5 w-5 text-sky-600 focus:ring-sky-500 border-gray-300"
      />
      <span className={`text-sm ${checked ? 'font-semibold text-sky-700' : 'text-gray-700'}`}>{label}</span>
    </label>
  );
};

export default RadioInput;
