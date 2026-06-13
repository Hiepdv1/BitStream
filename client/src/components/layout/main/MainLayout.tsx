import { FC, Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import HeaderSkeleton from "./HeaderSkeleton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background text-text-main transition-colors duration-300">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="flex-1 w-full relative z-10">{children}</main>
      <Footer />
    </div>
  );
};
