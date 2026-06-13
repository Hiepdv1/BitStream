"use client";

import { memo, useCallback, useState, InputHTMLAttributes } from "react";

export interface ToggleSwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> {
  checked: boolean;
  onChange: (checked: boolean) => void | Promise<void>;
  label?: string;
  description?: string;
}

export const ToggleSwitch = memo(function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled: externalDisabled,
  id,
  ...props
}: ToggleSwitchProps) {
  const [isPending, setIsPending] = useState(false);

  const handleChange = useCallback(async () => {
    if (externalDisabled || isPending) return;

    try {
      setIsPending(true);
      await onChange(!checked);
    } finally {
      setIsPending(false);
    }
  }, [checked, externalDisabled, isPending, onChange]);

  const isDisabled = externalDisabled || isPending;

  return (
    <label
      htmlFor={id}
      className={`toggle-switch-wrapper ${isDisabled ? "toggle-switch-disabled" : ""} ${isPending ? "toggle-switch-loading" : ""}`}
    >
      {(label || description) && (
        <div className="toggle-switch-text">
          {label && <span className="toggle-switch-label">{label}</span>}
          {description && (
            <span className="toggle-switch-description">{description}</span>
          )}
        </div>
      )}

      <div className="toggle-switch-track-wrapper">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={isDisabled}
          className="toggle-switch-input"
          {...props}
        />
        <div
          className={`toggle-switch-track ${checked ? "toggle-switch-track-on" : ""}`}
        >
          <div
            className={`toggle-switch-thumb ${checked ? "toggle-switch-thumb-on" : ""} ${isPending ? "scale-75 opacity-50" : ""}`}
          />
        </div>
      </div>
    </label>
  );
});
