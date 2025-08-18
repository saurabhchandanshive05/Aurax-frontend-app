import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const LiveNotifications = ({ position = "top-right", maxVisible = 3 }) => {
  const { currentTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const mockNotifications = [
        {
          type: "campaign",
          title: "New Campaign Offer",
          message: "Nike wants to collaborate with you",
          icon: "💼",
        },
        {
          type: "achievement",
          title: "Achievement Unlocked!",
          message: "Reached 10K followers milestone",
          icon: "🏆",
        },
        {
          type: "payment",
          title: "Payment Received",
          message: "$2,450 from Apple Campaign",
          icon: "💰",
        },
        {
          type: "engagement",
          title: "Viral Content!",
          message: "Your post got 50K+ likes",
          icon: "🔥",
        },
        {
          type: "message",
          title: "New Message",
          message: "Brand manager sent you a message",
          icon: "💬",
        },
      ];

      const randomNotification = {
        ...mockNotifications[
          Math.floor(Math.random() * mockNotifications.length)
        ],
        id: Date.now(),
        timestamp: new Date(),
      };

      setNotifications((prev) => [
        randomNotification,
        ...prev.slice(0, maxVisible - 1),
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, [maxVisible]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getPositionClasses = () => {
    const positions = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
    };
    return positions[position] || positions["top-right"];
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 w-80`}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-card p-4 cursor-pointer group"
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{notification.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm">
                  {notification.title}
                </h4>
                <p className="text-gray-300 text-xs mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveNotifications;

