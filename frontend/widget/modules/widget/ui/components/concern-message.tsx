"use client";

interface ConcernMessageProps {
  detectedIssue: string;
  primaryColor?: string;
}

export const ConcernMessage = ({
  detectedIssue,
  primaryColor = "#3b82f6",
}: ConcernMessageProps) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-3 text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)]">
        <p
          className="mb-2 text-[11px] font-semibold"
          style={{ color: primaryColor }}
        >
          Support Team
        </p>
        <p className="text-sm leading-relaxed text-neutral-700 mb-2">
          I understand you're experiencing an issue with{" "}
          <strong>{detectedIssue}</strong>. I'm here to help resolve this
          quickly.
        </p>
        <p className="text-sm text-neutral-700">
          To better assist you and keep you updated, I'll need to collect some
          information:
        </p>
      </div>
    </div>
  );
};
