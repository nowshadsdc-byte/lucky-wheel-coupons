/**
 * Tiny localStorage-backed "DB". All app data flows through here so you can
 * later swap each function in `users.ts` / `rewards.ts` / `auth.ts` for real
 * HTTP calls to your Laravel/Node backend without touching components.
 */
import type { Reward, User } from "../types";

const KEYS = {
  users: "stw:users",
  rewards: "stw:rewards",
  currentUserId: "stw:currentUserId",
  adminSession: "stw:adminSession",
} as const;

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: "FREE",
    reward_name: "100% Free Course",
    label: "100% FREE",
    probability: 1,
    is_active: true,
    max_limit: 1,
    total_won: 0,
    color: "var(--brand-coral)",
  },
  {
    id: "OFF30",
    reward_name: "30% OFF All Courses",
    label: "30% OFF",
    probability: 14,
    is_active: true,
    max_limit: 0,
    total_won: 0,
    color: "var(--brand-orange)",
  },
  {
    id: "OFF20",
    reward_name: "20% OFF All Courses",
    label: "20% OFF",
    probability: 35,
    is_active: true,
    max_limit: 0,
    total_won: 0,
    color: "var(--brand-teal)",
  },
  {
    id: "OFF10",
    reward_name: "10% OFF All Courses",
    label: "10% OFF",
    probability: 50,
    is_active: true,
    max_limit: 0,
    total_won: 0,
    color: "var(--brand-green)",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUsers: (): User[] => read<User[]>(KEYS.users, []),
  setUsers: (users: User[]) => write(KEYS.users, users),

  getRewards: (): Reward[] => {
    const r = read<Reward[]>(KEYS.rewards, []);
    return r.length ? r : DEFAULT_REWARDS;
  },
  setRewards: (rewards: Reward[]) => write(KEYS.rewards, rewards),

  getCurrentUserId: (): string | null =>
    isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null,
  setCurrentUserId: (id: string | null) => {
    if (!isBrowser()) return;
    if (id) localStorage.setItem(KEYS.currentUserId, id);
    else localStorage.removeItem(KEYS.currentUserId);
  },

  getAdminSession: () => read<{ email: string; loggedInAt: string } | null>(KEYS.adminSession, null),
  setAdminSession: (s: { email: string; loggedInAt: string } | null) => {
    if (!isBrowser()) return;
    if (s) localStorage.setItem(KEYS.adminSession, JSON.stringify(s));
    else localStorage.removeItem(KEYS.adminSession);
  },

  reset: () => {
    if (!isBrowser()) return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
