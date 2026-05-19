import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { listUsers } from "../lib/api/users";
import { listRewards } from "../lib/api/rewards";
import type { RewardKey } from "../lib/types";

export const Route = createFileRoute("/admin/_protected/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const users = listUsers();
  const rewards = listRewards();
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalSpins = users.filter((u) => u.has_spun).length;
    const totalWinners = users.filter((u) => u.reward_won).length;
    const claimed = users.filter((u) => u.claimed).length;
    const perReward: Record<RewardKey, number> = { FREE: 0, OFF30: 0, OFF20: 0, OFF10: 0 };
    users.forEach((u) => { if (u.reward_won) perReward[u.reward_won]++; });
    return { totalUsers, totalSpins, totalWinners, claimed, perReward };
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase">Overview</h1>
        <p className="text-sm text-muted-foreground">Snapshot of campaign activity</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Users" value={stats.totalUsers} color="bg-brand-coral" />
        <Stat label="Total Spins" value={stats.totalSpins} color="bg-brand-orange" />
        <Stat label="Winners" value={stats.totalWinners} color="bg-brand-teal" />
        <Stat label="Claimed" value={stats.claimed} color="bg-brand-green" />
      </div>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Reward distribution</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rewards.map((r) => {
            const won = stats.perReward[r.id];
            const pct = stats.totalWinners ? Math.round((won / stats.totalWinners) * 100) : 0;
            return (
              <div key={r.id} className="border rounded-xl p-4 bg-card">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-3 rounded-sm" style={{ background: r.color }} />
                  <div className="text-sm font-semibold">{r.reward_name}</div>
                </div>
                <div className="mt-2 text-2xl font-bold font-display">{won}</div>
                <div className="text-xs text-muted-foreground">{pct}% of winners · weight {r.probability}</div>
                <div className="mt-2 h-1.5 bg-secondary rounded">
                  <div className="h-full rounded" style={{ width: `${pct}%`, background: r.color }} />
                </div>
                {!r.is_active && <div className="mt-2 text-xs text-destructive font-medium">Disabled</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border rounded-xl bg-card p-4 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-3xl font-bold font-display mt-1">{value}</div>
    </div>
  );
}
