import { AuthCardProps } from "../../types/auth";

export function AuthCard({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-5xl px-4">
      <div className="auth-card-horizontal glass-card-enhanced animate-slide-up">
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-brand/10 to-accent/10 opacity-50 pointer-events-none"></div>

        <div className="auth-card-content">
          <div className="auth-card-header">
            <div className="auth-header-content">
              {showLogo && (
                <div className="flex justify-center lg:justify-start mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-brand to-accent blur-2xl opacity-60 animate-pulse-slow"></div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-brand to-accent rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <h1 className="auth-card-title">{title}</h1>
              {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="auth-card-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
