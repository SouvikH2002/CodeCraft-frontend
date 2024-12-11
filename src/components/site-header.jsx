import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 z-50 w-full bg-[#0A0A16]"
    >
      <div className="container flex h-14 items-center px-10">
        <div className="mr-6 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold text-[#CCFF00]">CodeCraft</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-8 md:justify-end">
          <nav className="flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-semibold text-white transition-colors hover:text-[#CCFF00]"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-semibold text-white transition-colors hover:text-[#CCFF00]"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-8">
            <Link
              href="/login"
              className="text-sm font-semibold text-white transition-colors hover:text-[#CCFF00]"
            >
              Sign in
            </Link>
            <Button
              variant="default"
              className="bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90"
            >
              Sign up for free
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
