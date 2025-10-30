"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

type MenuKey = "product" | "resources" | "company" | null;

export default function LandingNavbar({ initialDark = false }: { initialDark?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 5);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = useMemo(() => initialDark || isScrolled || !!openMenu, [initialDark, isScrolled, openMenu]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
      <div className={`mx-auto transition-all duration-300 ${isScrolled ? 'max-w-6xl mt-2 rounded-2xl shadow-xl' : 'max-w-7xl'}`} style={{ backgroundColor: isDark ? "#0C0C0C" : "transparent" }}>
        <div className="px-6 md:px-8 h-[64px] flex items-center relative" onMouseLeave={() => setOpenMenu(null)}>
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg"
              alt="Surbee"
              className={`h-10 transition ${isDark ? "invert" : ""}`}
            />
          </Link>

          {/* Center links + mega menus */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <button
              className="px-4 py-2 text-[11px] font-[450] uppercase tracking-wider leading-[1.3] transition-all duration-200 text-current hover:opacity-70"
              style={{ fontFamily: '"abcNormalLight", system-ui, sans-serif' }}
              onMouseEnter={() => setOpenMenu("product")}
            >
              Product
            </button>
            <button
              className="px-4 py-2 text-[11px] font-[450] uppercase tracking-wider leading-[1.3] transition-all duration-200 text-current hover:opacity-70"
              style={{ fontFamily: '"abcNormalLight", system-ui, sans-serif' }}
              onMouseEnter={() => setOpenMenu("resources")}
            >
              Resources
            </button>
            <button
              className="px-4 py-2 text-[11px] font-[450] uppercase tracking-wider leading-[1.3] transition-all duration-200 text-current hover:opacity-70"
              style={{ fontFamily: '"abcNormalLight", system-ui, sans-serif' }}
              onMouseEnter={() => setOpenMenu("company")}
            >
              Company
            </button>
            <Link href="/blog" className="px-4 py-2 text-[11px] font-[450] uppercase tracking-wider leading-[1.3] transition-all duration-200 text-current hover:opacity-70" style={{ fontFamily: '"abcNormalLight", system-ui, sans-serif' }}>
              Blog
            </Link>
            <a
              href="https://discord.gg/krs577Qxqr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[11px] font-[450] uppercase tracking-wider leading-[1.3] transition-all duration-200 flex items-center gap-2 text-current hover:opacity-70"
              style={{ fontFamily: '"abcNormalLight", system-ui, sans-serif' }}
            >
              <FaDiscord className="w-4 h-4 opacity-70" /> Community
            </a>
          </div>

          {/* Right side auth/CTA */}
          <div className="flex items-center gap-4 ml-auto">
            {loading ? (
              <div className={`px-4 py-2 rounded-full border ${isDark ? "border-white/50 text-white/80" : "border-black/60 text-black/80"}`}>Loading…</div>
            ) : user ? (
              <Link href="/dashboard" className="px-3 py-1.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition font-medium" style={{ fontFamily: 'abcNormalLight, sans-serif' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={`${isDark ? "text-white" : "text-black"} hover:opacity-80 transition font-medium`} style={{ fontFamily: 'abcNormalLight, sans-serif' }}>Sign in</Link>
                <Link href="/signup" className="px-3 py-1.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition font-medium" style={{ fontFamily: 'abcNormalLight, sans-serif' }}>Get Started</Link>
              </>
            )}
            <button className="md:hidden p-2">
              <Menu className={`w-5 h-5 ${isDark ? "text-white" : "text-black"}`} />
            </button>
          </div>
        </div>

        {/* Mega menus with updated styling */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed left-0 right-0 top-[64px] w-full z-40"
              onMouseEnter={() => setOpenMenu(openMenu)}
            >
              <div className="shadow-2xl" style={{ backgroundColor: '#0C0C0C' }}>
                <div className="max-w-[1600px] mx-auto px-8">
                  <div className="py-12 mx-auto" style={{ width: "fit-content" }}>
                    <AnimatePresence mode="wait">
                      {openMenu === "product" && (
                        <motion.div
                          key="product"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="flex gap-8 text-white"
                        >
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Main</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <Link href="/earlyaccess" className="hover:underline whitespace-nowrap">
                                  Surbee Lyra
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="#" className="hover:underline whitespace-nowrap">
                                  Surbee Cipher
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="#" className="hover:underline whitespace-nowrap">
                                  Credit Network
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Featured</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <Link href="/pricing" className="hover:underline whitespace-nowrap">
                                  Pricing
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="/changelog" className="hover:underline whitespace-nowrap">
                                  What's New
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="/students" className="hover:underline whitespace-nowrap">
                                  For Students
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="#" className="hover:underline whitespace-nowrap">
                                  Enterprise
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="#" className="hover:underline whitespace-nowrap">
                                  AI Surveys
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                      {openMenu === "resources" && (
                        <motion.div
                          key="resources"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="flex gap-8 text-white"
                        >
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Learn</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <Link href="/blog" className="hover:underline whitespace-nowrap">
                                  Blog
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="/changelog" className="hover:underline whitespace-nowrap">
                                  Changelog
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="#" className="hover:underline whitespace-nowrap">
                                  Guides
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Docs</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  API Reference
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Integration
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  SDK
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Community</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <a href="https://discord.gg/krs577Qxqr" target="_blank" className="hover:underline whitespace-nowrap">
                                  Discord
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  X / Twitter
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  GitHub
                                </a>
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                      {openMenu === "company" && (
                        <motion.div
                          key="company"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="flex gap-8 text-white"
                        >
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Company</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <Link href="/about" className="hover:underline whitespace-nowrap">
                                  About
                                </Link>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Careers
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Press
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Legal</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <Link href="/privacy" className="hover:underline whitespace-nowrap">
                                  Privacy
                                </Link>
                              </li>
                              <li className="pb-1">
                                <Link href="/terms" className="hover:underline whitespace-nowrap">
                                  Terms
                                </Link>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Security
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div className="w-40">
                            <div className="text-xs mb-2 text-gray-400 uppercase tracking-wider">Contact</div>
                            <ul className="text-sm space-y-1">
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Support
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Partners
                                </a>
                              </li>
                              <li className="pb-1">
                                <a href="#" className="hover:underline whitespace-nowrap">
                                  Sales
                                </a>
                              </li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="h-5"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
