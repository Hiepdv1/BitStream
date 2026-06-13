import React from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full overflow-hidden flex flex-col min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
