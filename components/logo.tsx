import Image from "next/image";

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="NeighborLoop"
      width={size}
      height={size}
      priority
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
    />
  );
}
