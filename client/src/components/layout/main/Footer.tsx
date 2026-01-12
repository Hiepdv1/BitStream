import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"; // Removed Film
import Link from "next/link";
import { Logo } from "@/components/brand"; // Added Logo import

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm mt-auto">
      <div className="mx-auto w-full px-6 py-12 lg:px-8">
        {/* Top section with logo and social */}
        <div className="mb-8 flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
          </div>

          {/* Social media links */}
          <div className="flex gap-4">
            <a
              href="#"
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-purple-400 transition-all"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-purple-400 transition-all"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-purple-400 transition-all"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-purple-400 transition-all"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* Watch */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Watch</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Browse All
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Trending Now
                </Link>
              </li>
              <li>
                <Link
                  href="/new-releases"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  New Releases
                </Link>
              </li>
              <li>
                <Link
                  href="/top-rated"
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Top Rated
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} BitStream. All rights reserved. Made with{" "}
            <span className="text-purple-400">♥</span> for film lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
