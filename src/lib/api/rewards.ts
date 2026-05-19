import type { Reward, RewardKey } from "../types";
import { store, DEFAULT_REWARDS } from "./store";

export function listRewards(): Reward[] {
  return store.getRewards();
}

export function getReward(id: RewardKey): Reward | null {
  return store.getRewards().find((r) => r.id === id) ?? null;
}

export function setRewardActive(id: RewardKey, is_active: boolean) {
  const rewards = store.getRewards().map((r) => (r.id === id ? { ...r, is_active } : r));
  store.setRewards(rewards);
  return rewards;
}

export function setProbabilities(probs: Record<RewardKey, number>) {
  const rewards = store.getRewards().map((r) => ({ ...r, probability: probs[r.id] ?? r.probability }));
  store.setRewards(rewards);
  return rewards;
}

export function incrementWon(id: RewardKey) {
  const rewards = store.getRewards().map((r) => {
    if (r.id !== id) return r;
    const total_won = r.total_won + 1;
    const reachedLimit = r.max_limit > 0 && total_won >= r.max_limit;
    return { ...r, total_won, is_active: reachedLimit ? false : r.is_active };
  });
  store.setRewards(rewards);
  return rewards;
}

export function resetRewardCounts() {
  store.setRewards(DEFAULT_REWARDS.map((r) => ({ ...r })));
}
