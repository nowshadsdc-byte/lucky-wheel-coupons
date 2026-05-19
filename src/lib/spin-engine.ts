import type { Reward, RewardKey, User } from "./types";
import { incrementWon, listRewards } from "./api/rewards";
import { updateUser } from "./api/users";

/** Pick a reward index using weighted random over currently-active rewards. */
export function pickReward(rewards: Reward[]): Reward {
  const eligible = rewards.filter(
    (r) => r.is_active && (r.max_limit === 0 || r.total_won < r.max_limit),
  );
  const pool = eligible.length ? eligible : rewards.filter((r) => r.id !== "FREE");
  const total = pool.reduce((s, r) => s + Math.max(0, r.probability), 0) || 1;
  let n = Math.random() * total;
  for (const r of pool) {
    n -= Math.max(0, r.probability);
    if (n <= 0) return r;
  }
  return pool[pool.length - 1];
}

function generateCoupon(rewardId: RewardKey, existing: Set<string>): string {
  const suffix = (id: RewardKey) =>
    id === "FREE" ? "FREE" : id === "OFF30" ? "30OFF" : id === "OFF20" ? "20OFF" : "10OFF";
  for (let i = 0; i < 50; i++) {
    const n = Math.floor(10000 + Math.random() * 90000);
    const code = `SDC-${suffix(rewardId)}-${n}`;
    if (!existing.has(code)) return code;
  }
  return `SDC-${suffix(rewardId)}-${Date.now()}`;
}

/** Execute the spin for a user. Returns the reward + coupon. */
export function spinForUser(user: User, existingCoupons: Set<string>) {
  if (user.has_spun) throw new Error("This user has already spun.");
  const rewards = listRewards();
  const reward = pickReward(rewards);
  const coupon = generateCoupon(reward.id, existingCoupons);
  updateUser(user.id, {
    has_spun: true,
    reward_won: reward.id,
    coupon_code: coupon,
  });
  incrementWon(reward.id);
  return { reward, coupon };
}

/** Index of reward in the wheel ring (clockwise from top). */
export function rewardIndex(rewards: Reward[], id: RewardKey) {
  return rewards.findIndex((r) => r.id === id);
}
