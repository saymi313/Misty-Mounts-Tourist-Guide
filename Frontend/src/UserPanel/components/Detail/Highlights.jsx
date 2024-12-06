import React from 'react';

const Highlights = () => {
  const highlights = [
    { icon: "🆓", title: "Free Cancellation", desc: "Cancel up to 24 hours in advance for a full refund" },
    { icon: "🛡️", title: "Health Precautions", desc: "Special health and safety measures apply" },
    { icon: "📱", title: "Mobile Ticketing", desc: "Use your phone or print your voucher" },
    { icon: "⏱️", title: "Duration 3.5 Hours", desc: "Check availability to see starting times" },
    { icon: "⚡", title: "Instant Confirmation", desc: "Don’t wait for the confirmation!" },
    { icon: "🎤", title: "Live Tour Guide in English", desc: "English" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 px-8 py-4">
      {highlights.map((item, index) => (
        <div key={index} className="flex items-start space-x-4">
          <span className="text-3xl">{item.icon}</span>
          <div>
            <h4 className="font-bold">{item.title}</h4>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Highlights;
