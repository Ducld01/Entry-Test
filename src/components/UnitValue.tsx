import { useState } from "react";

type Unit = "%" | "px";

const UnitValue = () => {
  const [unit, setUnit] = useState<Unit>("%");
  const [value, setValue] = useState<string>("1.0");
  const [lastValidValue, setLastValidValue] = useState<string>("1.0");

  const cleanNumericValue = (input: string): string => {
    const cleaned = input.replace(",", ".");
    let startIndex = -1;
    let hasMinus = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (char === "-") {
        startIndex = i;
        hasMinus = true;
        break;
      } else if (char >= "0" && char <= "9") {
        startIndex = i;
        break;
      } else if (char === ".") {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      return "";
    }

    let result = "";
    let dotFound = false;

    for (let i = startIndex; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (i === startIndex && hasMinus && char === "-") {
        result += char;
      } else if (char >= "0" && char <= "9") {
        result += char;
      } else if (char === "." && !dotFound) {
        result += char;
        dotFound = true;
      } else {
        break;
      }
    }

    const parts = result.split(".");
    if (parts.length > 2) {
      result = parts[0] + "." + parts.slice(1).join("");
    }

    return result;
  };

  const getNearestValidValue = (input: string): string => {
    const cleaned = cleanNumericValue(input);
    if (cleaned === "" || cleaned === "." || cleaned === "-") {
      return lastValidValue;
    }

    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) {
      return lastValidValue;
    }

    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  const handleInputBlur = () => {
    let cleanedValue = cleanNumericValue(value);

    if (cleanedValue === "" || cleanedValue === ".") {
      cleanedValue = getNearestValidValue(value);
    }

    let numValue = parseFloat(cleanedValue);

    if (isNaN(numValue)) {
      numValue = parseFloat(lastValidValue);
      cleanedValue = lastValidValue;
    }

    if (numValue < 0) {
      numValue = 0;
      cleanedValue = "0";
    }

    if (unit === "%") {
      if (numValue > 100) {
        // Revert to last valid value (which should be <= 100)
        const lastValidNum = parseFloat(lastValidValue);
        if (!isNaN(lastValidNum) && lastValidNum <= 100) {
          numValue = lastValidNum;
          cleanedValue = lastValidValue;
        } else {
          // If lastValidValue is also invalid, set to 100
          numValue = 100;
          cleanedValue = "100";
        }
      }
    }

    const finalValue = numValue.toString();
    setValue(finalValue);
    setLastValidValue(finalValue);
  };

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;

    if (unit === "px" && newUnit === "%") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 100) {
        setValue("100");
        setLastValidValue("100");
      }
    }

    setUnit(newUnit);
  };

  const handleIncrement = () => {
    const numValue = parseFloat(value) || 0;
    const newValue = numValue + 1;

    if (unit === "%" && newValue > 100) {
      return;
    }

    const newValueStr = newValue.toString();
    setValue(newValueStr);
    setLastValidValue(newValueStr);
  };

  const handleDecrement = () => {
    const numValue = parseFloat(value) || 0;
    const newValue = Math.max(0, numValue - 1);
    const newValueStr = newValue.toString();
    setValue(newValueStr);
    setLastValidValue(newValueStr);
  };

  const isDecrementDisabled = unit === "%" && (parseFloat(value) || 0) === 0;

  const isIncrementDisabled = unit === "%" && (parseFloat(value) || 0) === 100;

  return (
    <div className="space-y-4">
      {/* Unit Selection */}
      <div className="flex items-center justify-between">
        <label className="text-[#AAAAAA] text-xs font-normal">Unit</label>
        <div className="flex bg-[#212121] rounded-lg overflow-hidden p-[2px] max-w-[140px] w-full gap-[2px]">
          <button
            onClick={() => handleUnitChange("%")}
            className={`text-sm font-medium text-[#AAAAAA] rounded-md w-full py-[6px] cursor-pointer ${
              unit === "%"
                ? "bg-[#424242] text-[#F9F9F9]"
                : "bg-inherit text-[#AAAAAA] hover:text-[#F9F9F9] hover:bg-[#424242]"
            }`}
          >
            %
          </button>
          <button
            onClick={() => handleUnitChange("px")}
            className={`text-sm font-medium text-[#AAAAAA] rounded-md w-full py-[6px] cursor-pointer ${
              unit === "px"
                ? "bg-[#424242] text-[#F9F9F9]"
                : "bg-inherit text-[#AAAAAA] hover:text-[#F9F9F9] hover:bg-[#424242]"
            }`}
          >
            px
          </button>
        </div>
      </div>

      {/* Value Stepper */}
      <div className="flex items-center justify-between">
        <label className="text-[#AAAAAA] text-xs font-normal">Value</label>
        <div className="group relative max-w-[140px] w-full">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full h-9 pl-9 pr-9 bg-[#212121] text-[#F9F9F9] text-xs text-center rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#3C67FF] hover:bg-[#3B3B3B] transition-colors"
          />
          <button
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            className={`absolute left-0 top-0 w-9 h-9 flex items-center justify-center text-[#F9F9F9] font-medium transition-colors rounded-l-[3px] ${
              isDecrementDisabled
                ? "text-[rgba(170,170,170,0.67)] cursor-not-allowed"
                : "hover:bg-[#3B3B3B] cursor-pointer"
            }`}
          >
            -
          </button>
          <button
            onClick={handleIncrement}
            disabled={isIncrementDisabled}
            className={`absolute right-0 top-0 w-9 h-9 flex items-center justify-center text-[#F9F9F9] font-medium transition-colors rounded-r-[3px] ${
              isIncrementDisabled
                ? "text-[rgba(170,170,170,0.67)] cursor-not-allowed"
                : "hover:bg-[#3B3B3B] cursor-pointer"
            }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitValue;
