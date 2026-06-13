import { Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-surface backdrop-blur-xl mt-auto relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-[1920px] px-6 py-16 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo className="w-8 h-8 text-brand" />
              <span className="text-xl font-bold text-white tracking-tight">
                BitStream
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mb-8">
              The ultimate destination for next-generation streaming. Join our
              community and experience entertainment like never before.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "Youtube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-full p-2.5 bg-white/5 text-zinc-400 hover:bg-brand hover:text-white transition-all transform hover:-translate-y-1"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Company",
              links: [
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "/careers" },
                { name: "Press", href: "/press" },
                { name: "Blog", href: "/blog" },
              ],
            },
            {
              title: "Support",
              links: [
                { name: "Help Center", href: "/help" },
                { name: "Contact Us", href: "/contact" },
                { name: "FAQ", href: "/faq" },
                { name: "Safety", href: "/safety" },
              ],
            },
            {
              title: "Legal",
              links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookies" },
                { name: "Guidelines", href: "/guidelines" },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold dark:text-white text-zinc-700 tracking-wider uppercase mb-6">
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-brand transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © {currentYear} BitStream Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>in React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
