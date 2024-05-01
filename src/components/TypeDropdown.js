import React from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles";
import { vulType } from "../constants/vulType";

const TypeDropdown = ({ onSelectChange }) => {
    return (
        <Select
            placeholder={`Filter By Type of Vulnerability`}
            options={vulType}
            styles={customStyles}
            defaultValue={vulType[0]}
            onChange={(selectedOption) => onSelectChange(selectedOption)}
        />
    );
};

export default TypeDropdown;