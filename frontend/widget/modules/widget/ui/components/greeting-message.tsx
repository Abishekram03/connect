"use client";

interface GreetingMessageProps {
  agentName?: string;
  message?: string;
  primaryColor?: string;
}

export const GreetingMessage = ({
  agentName = "Support Team",
  message = "Welcome! How can we help you today?",
  primaryColor = "#3b82f6",
}: GreetingMessageProps) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-3 text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)] border border-neutral-200">
        <p
          className="mb-2 text-[11px] font-semibold"
          style={{ color: primaryColor }}
        >
          {agentName}
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">{message}</p>
        <p className="mt-2 text-[10px] text-neutral-500">
          To better assist you, we'll ask for your name and email after you
          describe your issue.
        </p>
      </div>
    </div>
  );
};
