import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme-provider";
import ReactQueryProvider from "./react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        {children}
        <ConfirmDialog />
        <ReactQueryDevtools initialIsOpen={false} />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
