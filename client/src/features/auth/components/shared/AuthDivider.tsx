export function AuthDivider() {
  return (
    <div className="relative my-6 sm:my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 py-1 bg-black/70 text-text-muted backdrop-blur-sm rounded-full font-medium">
          OR
        </span>
      </div>
    </div>
  );
}
