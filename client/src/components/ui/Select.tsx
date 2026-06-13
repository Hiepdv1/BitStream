import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const selectVariants = cva(
  "w-full outline-none transition-all duration-200 font-medium text-text-main text-sm rounded-xl appearance-none pr-10 cursor-pointer border-2 border-border",
  {
    variants: {
      variant: {
        default: "input-field peer",
        surface: "h-11 px-4 bg-surface border",
        admin: "admin-gift-form-select",
      },
      hasError: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        hasError: true,
        class: "input-field-error",
      },
      {
        variant: "default",
        hasError: false,
        class: "border-white/10",
      },
      {
        variant: "surface",
        hasError: true,
        class: "border-error focus:border-error",
      },
      {
        variant: "surface",
        hasError: false,
        class: "focus:border-brand focus:ring-4 focus:ring-brand/20 hover:border-text-muted/30",
      },
      {
        variant: "admin",
        hasError: true,
        class: "admin-gift-form-input--error",
      },
    ],
    defaultVariants: {
      variant: "default",
      hasError: false,
    },
  }
);

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, variant = "default", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(selectVariants({ variant, hasError: !!error }), className)}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-text-muted" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
