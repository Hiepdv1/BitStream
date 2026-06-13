import Link from "next/link";
import { Ghost } from "lucide-react";

export default function StreamNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <Ghost className="w-24 h-24 text-text-muted mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-text-main mb-4">Stream Not Found</h1>
      <p className="text-text-muted max-w-md mx-auto mb-8">
        This stream may have been deleted by the creator, or the link you followed is incorrect.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
