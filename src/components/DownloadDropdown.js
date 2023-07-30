import '../styles/DownloadDropdown.css';
import React, { useState } from "react";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

const Dropdown = ({ options, onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (option) => {
    setIsOpen(false);
    onSelectOption(option);
  };

  return (
    <div className="dropdown-container">
      <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
        <ion-icon size="large" name="code-download-outline"/>
        <ion-icon name={`chevron-${isOpen ? "up" : "down"}`} />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleOptionSelect(option)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;