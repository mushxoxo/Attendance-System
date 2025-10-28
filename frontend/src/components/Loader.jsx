import { motion } from "framer-motion";

const Loader = ({ size = 40, color = "#3b82f6" }) => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderRadius: "50%",
          borderTopColor: "transparent",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default Loader;
