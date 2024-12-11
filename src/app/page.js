"use client";
import { motion } from "framer-motion";
import { Code, Users, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CodeEditor } from "@/components/code-editor";
import { FeatureItem } from "@/components/feature-item";
import "@/app/css/home.css";
export default function page() {
  return (
    <div className="min-h-screen bg-[#0A0A16] font-GeistSans">
      <SiteHeader />
      <main className="container flex min-h-screen flex-col items-center justify-center space-y-20 py-20 px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
            The best place for{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="whitespace-nowrap"
            >
              {"<"}
              <span className="text-[#CCFF00]">PROGRAMMERS</span>
              {"/>"}
            </motion.span>
            <br />
            to write and run code
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Button className="bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90">
              Explore the editor
              <span className="ml-2">→</span>
            </Button>
          </motion.div>
        </motion.div>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <FeatureItem
              icon={Code}
              title="Write and Run Code"
              description="Our powerful in-browser code editor allows you to write, edit, and run code in multiple programming languages. Get instant feedback and see your code in action."
            />
            <FeatureItem
              icon={Users}
              title="Real-time Collaboration"
              description="Work together seamlessly with real-time multi-user editing. See changes as they happen and code alongside your team members."
            />
            <FeatureItem
              icon={Zap}
              title="Audio Conferencing"
              description="Communicate effortlessly with built-in audio conferencing. Discuss your code, explain concepts, and solve problems together as if you're in the same room."
            />
            <FeatureItem
              icon={Play}
              title="Syntax Highlighting"
              description="Enjoy crystal-clear code readability with our advanced syntax highlighting. Supporting a wide range of programming languages, it makes your code more understandable and easier to debug.."
            />
          </div>
          <div className="font-GeistMono">
            <CodeEditor />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
