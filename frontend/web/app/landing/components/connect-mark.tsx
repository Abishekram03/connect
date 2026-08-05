import logo from "@/public/connect-logo.png";

export function ConnectMark({
  className = "",
  size = 36,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt="Connect"
        width={size}
        height={size}
        className="object-contain"
      />
      {showWordmark && (
        <span className="font-display text-2xl leading-none tracking-tight">Connect</span>
      )}
    </span>
  );
}
