import React from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cinema-bg flex flex-col min-h-screen">
      <div className="film-grain"></div>

      <div className="spotlight-1"></div>
      <div className="spotlight-2"></div>
      <div className="spotlight-3"></div>

      <div className="light-rays"></div>

      <div className="cinema-vignette"></div>

      <div className="cinema-content relative z-10 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
