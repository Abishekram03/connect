"use client";

interface GreetingMessageProps {
  agentName?: string;
  message?: string;
  primaryColor?: string;
}

export const GreetingMessage = ({
  agentName = "Kai",
  message = "Hi there! I'm Kai, your support assistant. How can I help you today?",
  primaryColor = "#3b82f6",
}: GreetingMessageProps) => {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200 overflow-hidden">
        <img src="/KAI_Logo.png" alt="Kai" className="h-5 w-5 object-contain" />
      </div>
      <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-3 text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)] border border-neutral-200">
        <p
          className="mb-2 text-[11px] font-semibold"
          style={{ color: primaryColor }}
        >
          {agentName}
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">{message}</p>
      </div>
    </div>
  );
};
