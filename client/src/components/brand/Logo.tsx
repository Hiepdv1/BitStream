interface LogoProps {
  className?: string;
  textClassName?: string;
  showText?: boolean;
  useGradientText?: boolean;
}

export function Logo({
  className = "w-8 h-8",
  textClassName = "text-2xl",
  showText = true,
  useGradientText = true,
}: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none focus:outline-none group">
      <div className={`relative ${className} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-[#FF5C00]/40 blur-lg rounded-full animate-pulse-slow group-hover:bg-[#FF5C00]/50 transition-colors duration-500"></div>

        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-sm"
        >
          <defs>
            <linearGradient
              id="logo-gradient"
              x1="0"
              y1="40"
              x2="40"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#e65200" />
              <stop offset="100%" stopColor="#FF5C00" />
            </linearGradient>
          </defs>

          <rect
            x="4"
            y="4"
            width="32"
            height="32"
            rx="8"
            fill="url(#logo-gradient)"
          />
          <path
            d="M16 12V28L28 20L16 12Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="28"
            y="6"
            width="4"
            height="4"
            rx="1"
            fill="#ffffff"
            className="animate-pulse"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight transition-colors duration-300 ${
            useGradientText
              ? "bg-clip-text text-transparent bg-linear-to-r from-[#FF5C00] to-orange-400"
              : "text-brand"
          } ${textClassName}`}
        >
          BitStream
        </span>
      )}
    </div>
  );
}
