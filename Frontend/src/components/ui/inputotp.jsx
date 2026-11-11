import React, { useRef } from "react";

function InputOtp({ length = 6, value = "", onChange, disabled = false }) {
  const inputRefs = useRef([]);

  const handleChange = (index, inputValue) => {
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    const newOtp = value.split("");

    newOtp[index] = digit;

    const result = newOtp.join("").slice(0, length);
    onChange(result);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const newOtp = value.split("");
        newOtp[index] = "";
        onChange(newOtp.join(""));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    onChange(pasted);

    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-3 w-full">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="
            !w-12 !h-14
            !min-w-0
            !p-0
            !border-2 !border-[#c8b5a5]
            !rounded-xl
            !bg-white
            !text-[#563b29]
            !text-2xl !font-bold
            !text-center
            !outline-none
            focus:!border-[#6f4e37]
            focus:!ring-2
            focus:!ring-[#6f4e37]/30
            disabled:!opacity-50
            transition-all
            text-black!
          "
        />
      ))}
    </div>
  );
}

export { InputOtp };
