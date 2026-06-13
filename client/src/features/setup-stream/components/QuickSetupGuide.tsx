import React from "react";
import { Rocket } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Open your encoder",
    text: "Launch OBS Studio, Streamlabs, or your preferred broadcasting software.",
  },
  {
    number: 2,
    title: "Configure stream",
    text: "Go to Settings > Stream. Select 'Custom' service and paste the RTMP Server URL.",
  },
  {
    number: 3,
    title: "Enter stream key",
    text: "Copy the Stream Key from the left panel and paste it into your encoder.",
  },
  {
    number: 4,
    title: "Go Live",
    text: "Click 'Start Streaming' in your encoder. Your preview will appear above.",
  },
];

export const QuickSetupGuide = () => {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-brand" />
        Quick Start
      </h3>
      
      <div className="flex flex-col gap-6 relative">
        {/* Optional connecting line */}
        <div className="absolute left-3.5 top-8 bottom-4 w-[1px] bg-white/5 hidden sm:block" />

        {steps.map((step) => (
          <div key={step.number} className="flex gap-4 relative z-10">
            <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center border border-white/5 shrink-0 mt-0.5">
              <span className="text-xs font-bold text-brand">
                {step.number}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-text-main">
                {step.title}
              </h4>
              <p className="text-sm font-medium text-text-muted leading-relaxed">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
