import React, { useState } from "react";
import { Copy, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyableFieldProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "value"
> {
  label: string;
  value: string;
  isSecret?: boolean;
  warningText?: string;
  extraAction?: React.ReactNode;
  inputClassName?: string;
  containerClassName?: string;
}

export const CopyableField = React.forwardRef<
  HTMLDivElement,
  CopyableFieldProps
>(
  (
    {
      label,
      value,
      isSecret = false,
      warningText,
      extraAction,
      className,
      inputClassName,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = useState(!isSecret);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied to clipboard`);
      } catch (err) {
        toast.error("Failed to copy");
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        <label className="text-sm font-semibold text-text-muted">{label}</label>

        <div
          className={cn(
            "flex items-center justify-between gap-3 bg-background/50 border border-border/50 rounded-xl px-4 py-3 group",
            containerClassName,
          )}
        >
          <div className="flex-1 overflow-hidden">
            <input
              type={isSecret && !show ? "password" : "text"}
              value={value}
              readOnly
              className={cn(
                "w-full bg-transparent outline-none text-text-main font-mono text-sm tracking-wide",
                inputClassName,
              )}
              aria-label={label}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {extraAction}

            {isSecret && (
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="cursor-pointer flex items-center text-xs font-medium text-text-muted hover:text-text-main transition-colors px-2 py-1 rounded-md hover:bg-white/5"
              >
                {show ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Show
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="cursor-pointer flex items-center text-xs font-medium text-brand hover:text-brand-hover transition-colors px-2 py-1 rounded-md hover:bg-brand/10"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </button>
          </div>
        </div>

        {warningText && (
          <div className="flex items-start gap-1.5 mt-0.5">
            <TriangleAlert className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-xs text-error font-medium">{warningText}</p>
          </div>
        )}
      </div>
    );
  },
);

CopyableField.displayName = "CopyableField";
