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
<<<<<<< HEAD
=======

export function createReward(
  reward_name: string,
  label: string,
  color: string,
  probability: number = 10,
  max_limit: number = 0
): Reward {
  const id = `CUSTOM_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const newReward: Reward = {
    id,
    reward_name,
    label,
    probability,
    is_active: true,
    max_limit,
    total_won: 0,
    color,
  };
  const rewards = store.getRewards();
  store.setRewards([...rewards, newReward]);
  return newReward;
}

export function updateReward(id: string, patch: Partial<Reward>): Reward | null {
  const rewards = store.getRewards();
  const idx = rewards.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated = { ...rewards[idx], ...patch, id: rewards[idx].id };
  rewards[idx] = updated;
  store.setRewards(rewards);
  return updated;
}

export function deleteReward(id: string): boolean {
  const rewards = store.getRewards();
  const filtered = rewards.filter((r) => r.id !== id);
  if (filtered.length === rewards.length) return false;
  store.setRewards(filtered);
  return true;
}
>>>>>>> master
