import React from "react";

interface SetupStreamLayoutProps {
  children?: React.ReactNode;
}

const SetupStreamLayout = ({ children }: SetupStreamLayoutProps) => {
  return <div>{children}</div>;
};

export default SetupStreamLayout;
