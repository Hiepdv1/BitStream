import { FC } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
interface IProps {
  children: React.ReactNode;
}

export const MainLayout: FC<IProps> = (props) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full relative z-10">{props.children}</main>
      <Footer />
    </div>
  );
};
