interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}: LoadingProps) {
  const content = (
    <div
      className={`loading-container ${
        fullScreen ? "loading-fullscreen" : ""
      } ${className}`}
    >
      <div className="loading-content">
        <div className={`loading-spinner loading-spinner-${size}`}>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );

  return content;
}
