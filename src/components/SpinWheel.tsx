import { useEffect, useRef, useState } from "react";
import type { Reward, RewardKey } from "../lib/types";

interface Props {
  rewards: Reward[];
  /** When set, wheel spins and lands on this reward. */
  targetRewardId: RewardKey | null;
  onSpinComplete?: () => void;
}

const SPIN_DURATION_MS = 5200;

export function SpinWheel({ rewards, targetRewardId, onSpinComplete }: Props) {
  const [angle, setAngle] = useState(0);
  const spinningRef = useRef(false);
  const size = 360;
  const r = size / 2;
  const n = rewards.length;
  const sliceDeg = 360 / n;

  useEffect(() => {
    if (!targetRewardId || spinningRef.current) return;
    spinningRef.current = true;
    const idx = rewards.findIndex((x) => x.id === targetRewardId);
    if (idx === -1) return;
    // Pointer at top (12 o'clock). Slice i center = i * sliceDeg + sliceDeg/2 (clockwise from top).
    // To land slice i under pointer, total rotation = 360*k - (i*slice + slice/2) + jitter
    const turns = 6;
    const jitter = (Math.random() - 0.5) * (sliceDeg * 0.6);
    const target = 360 * turns - (idx * sliceDeg + sliceDeg / 2) + jitter;
    setAngle(target);
    const t = setTimeout(() => {
      spinningRef.current = false;
      onSpinComplete?.();
    }, SPIN_DURATION_MS + 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRewardId]);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Pointer */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20">
        <div
          className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent drop-shadow"
          style={{ borderTopColor: "var(--brand-charcoal)" }}
        />
      </div>
      {/* Wheel */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{
          transform: `rotate(${angle}deg)`,
          transition: `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.16, 0.99)`,
        }}
        className="drop-shadow-xl"
      >
        <circle cx={r} cy={r} r={r - 2} fill="white" stroke="var(--brand-charcoal)" strokeWidth="4" />
        {rewards.map((reward, i) => {
          const startAngle = i * sliceDeg - 90;
          const endAngle = startAngle + sliceDeg;
          const x1 = r + r * Math.cos((startAngle * Math.PI) / 180);
          const y1 = r + r * Math.sin((startAngle * Math.PI) / 180);
          const x2 = r + r * Math.cos((endAngle * Math.PI) / 180);
          const y2 = r + r * Math.sin((endAngle * Math.PI) / 180);
          const largeArc = sliceDeg > 180 ? 1 : 0;
          const path = `M${r},${r} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
          const midAngle = startAngle + sliceDeg / 2;
          const labelX = r + r * 0.62 * Math.cos((midAngle * Math.PI) / 180);
          const labelY = r + r * 0.62 * Math.sin((midAngle * Math.PI) / 180);
          return (
            <g key={reward.id}>
              <path d={path} fill={reward.color} stroke="white" strokeWidth="3" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontWeight="800"
                fontSize="20"
                fontFamily="Space Grotesk, sans-serif"
                transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
              >
                {reward.label}
              </text>
            </g>
          );
        })}
        <circle cx={r} cy={r} r="28" fill="var(--brand-charcoal)" />
        <circle cx={r} cy={r} r="10" fill="white" />
      </svg>
    </div>
  );
}
