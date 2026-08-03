"use client";

import { useAtomValue } from "jotai";
import { widgetConfigAtom } from "../../atoms/widget-atoms";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo = ({ size = 40, className = "" }: BrandLogoProps) => {
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const logoUrl = widgetConfig?.logoUrl;
  const companyName = widgetConfig?.companyName || "Connect";
  const primaryColor = widgetConfig?.primaryColor || "#2563eb";

  const initial = companyName.charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl}
          alt={companyName}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: primaryColor,
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
};
