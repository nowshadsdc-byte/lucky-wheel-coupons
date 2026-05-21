import type { User, RewardKey } from "../types";
import { store } from "./store";

export function listUsers(): User[] {
  return store.getUsers().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getUserById(id: string): User | null {
  return store.getUsers().find((u) => u.id === id) ?? null;
}

export function getUserByPhone(phone: string): User | null {
  return store.getUsers().find((u) => u.phone_number === phone) ?? null;
}

export function createUser(input: Omit<User, "id" | "has_spun" | "reward_won" | "coupon_code" | "claimed" | "created_at">): User {
  const users = store.getUsers();
  if (users.some((u) => u.phone_number === input.phone_number)) {
    throw new Error("This phone number has already registered.");
  }
  const user: User = {
    ...input,
    id: crypto.randomUUID(),
    has_spun: false,
    reward_won: null,
    coupon_code: null,
    claimed: false,
    created_at: new Date().toISOString(),
  };
  store.setUsers([...users, user]);
  return user;
}

export function updateUser(id: string, patch: Partial<User>): User {
  const users = store.getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");
  users[idx] = { ...users[idx], ...patch };
  store.setUsers(users);
  return users[idx];
}

export function markClaimed(id: string, claimed: boolean) {
  return updateUser(id, { claimed });
}

export function resetAllSpins() {
  const users = store.getUsers().map((u) => ({
    ...u,
    has_spun: false,
    reward_won: null as RewardKey | null,
    coupon_code: null,
    claimed: false,
  }));
  store.setUsers(users);
}

export function exportUsersCSV(): string {
  const users = listUsers();
  const headers = [
    "id","full_name","phone_number","address",
<<<<<<< HEAD
    "course_option_1","course_option_2","course_option_3",
=======
    "course_option",
>>>>>>> master
    "has_spun","reward_won","coupon_code","claimed","created_at",
  ];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = users.map((u) => headers.map((h) => escape((u as any)[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}
