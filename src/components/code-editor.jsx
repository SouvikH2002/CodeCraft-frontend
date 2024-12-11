import { motion } from "framer-motion";

export function CodeEditor() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-[#1E1E1E] text-white"
    >
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-GeistSans">index.js</span>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 p-4">
          <pre className="text-sm">
            <code className="font-GeistMono">
              <span className="text-green-400">
                // Function to sum two numbers
              </span>
              {"\n"}
              <span className="text-purple-400">function</span>
              <span className="text-white"> sumElements(a, b) {"{"}</span>
              {"\n"}
              <span className="text-white">{"  "}return a + b;</span>
              {"\n"}
              <span className="text-white">{"}"}</span>
              {"\n\n"}
              <span className="text-green-400">// Example usage</span>
              {"\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white"> num1 = 5;</span>
              {"\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white"> num2 = 7;</span>
              {"\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white">
                {" "}
                result = sumElements(num1, num2);
              </span>
              {"\n\n"}
              <span className="text-green-400">// Print the result</span>
              {"\n"}
              <span className="text-blue-400">console</span>
              <span className="text-white">.log(</span>
              <span className="text-green-300">
                `The sum of ${"{"}num1{"}"} and ${"{"}num2{"}"} is: ${"{"}result
                {"}"}`
              </span>
              <span className="text-white">);</span>
            </code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
