import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#0A0A16] text-white">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-4xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">CodeCraft</h3>
            <p className="text-sm text-gray-400">
              The best place for programmers to write and run code.
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#support"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-400 hover:text-[#CCFF00]"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <h4 className="text-md font-semibold mb-4">Connect</h4>
            <div className="flex justify-center space-x-4">
              <Link href="#" className="text-gray-400 hover:text-[#CCFF00]">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#CCFF00]">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#CCFF00]">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#CCFF00]">
                <Github size={20} />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CodeCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
