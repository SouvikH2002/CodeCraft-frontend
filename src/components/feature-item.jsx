import { motion } from 'framer-motion'

export function FeatureItem({
  icon: Icon,
  title,
  description
}) {
  return (
    (<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start space-x-4 border-l-4 border-[#CCFF00] pl-6 font-sans">
      <div className="mt-1">
        <Icon className="h-6 w-6 text-[#CCFF00]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
    </motion.div>)
  );
}

