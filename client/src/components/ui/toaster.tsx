"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast flex items-start gap-3 w-full !bg-surface !border !rounded-xl py-4 px-4 !shadow-lg transition-all duration-300 backdrop-blur-md !text-text-main",
          title: "!text-[14px] !font-bold !tracking-tight !text-text-main",
          description:
            "!text-[12px] !text-text-secondary !mt-1 !font-medium !leading-relaxed",
          icon: "!mt-0.5",
          closeButton:
            "!opacity-0 group-hover:!opacity-100 !transition-opacity !bg-surface dark:!bg-white/10 !border-none !text-text-muted hover:!text-text-main !right-2 !top-2",

          actionButton:
            "!bg-brand !text-brand-foreground hover:!bg-brand-hover !px-3 !py-1.5 !rounded-lg !font-semibold !text-xs !transition-colors",
          cancelButton:
            "!bg-surface !text-text-secondary hover:!bg-surface-hover !px-3 !py-1.5 !rounded-lg !font-semibold !text-xs !transition-colors",

          success:
            "!border-success/50 !bg-success/5 dark:!bg-success/[0.03] !shadow-[0_8px_16px_-6px_rgba(16,185,129,0.2)]",
          error:
            "!border-error/50 !bg-error/5 dark:!bg-error/[0.03] !shadow-[0_8px_16px_-6px_rgba(239,68,68,0.2)]",
          info: "!border-info/50 !bg-info/5 dark:!bg-info/[0.03] !shadow-[0_8px_16px_-6px_rgba(59,130,246,0.2)]",
          warning:
            "!border-warning/50 !bg-warning/5 dark:!bg-warning/[0.03] !shadow-[0_8px_16px_-6px_rgba(245,158,11,0.2)]",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 !text-success" />,
        info: <Info className="w-5 h-5 !text-info" />,
        error: <XCircle className="w-5 h-5 !text-error" />,
        warning: <AlertTriangle className="w-5 h-5 !text-warning" />,
      }}
      position="top-right"
      closeButton={true}
      richColors={false}
      gap={12}
      {...props}
    />
  );
};

export { Toaster };
