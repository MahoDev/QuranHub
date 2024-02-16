import React, { useState, useEffect } from "react";

function SlidingNotification({ message, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-lg transition-transform ${
        isVisible ? "translate-y-0" : "translate-y-[100%]"
      }`}
    >
      <p>{message}</p>
    </div>
  );
}

export default SlidingNotification;
