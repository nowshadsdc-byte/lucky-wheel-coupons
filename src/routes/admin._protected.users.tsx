import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { exportUsersCSV, listUsers } from "../lib/api/users";
import { listRewards } from "../lib/api/rewards";
import type { RewardKey } from "../lib/types";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/_protected/users")({
  component: UsersPage,
});

function UsersPage() {
  const allUsers = listUsers();
  const rewards = listRewards();
  const [query, setQuery] = useState("");
  const [rewardFilter, setRewardFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesQuery =
        !query ||
        u.phone_number.includes(query) ||
        u.full_name.toLowerCase().includes(query.toLowerCase());
      const matchesReward =
        rewardFilter === "all"
          ? true
          : rewardFilter === "none"
          ? !u.reward_won
          : u.reward_won === (rewardFilter as RewardKey);
      return matchesQuery && matchesReward;
    });
  }, [allUsers, query, rewardFilter]);

  const downloadCSV = () => {
    const csv = exportUsersCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sdc-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold uppercase">Users</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {allUsers.length}</p>
        </div>
        <Button onClick={downloadCSV} variant="outline"><Download className="size-4" /> Export CSV</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search name or phone" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={rewardFilter} onValueChange={setRewardFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rewards</SelectItem>
            <SelectItem value="none">Not spun yet</SelectItem>
            {rewards.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Courses</th>
                <th className="text-left p-3">Reward</th>
                <th className="text-left p-3">Coupon</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const r = rewards.find((x) => x.id === u.reward_won);
                return (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-medium">{u.full_name}</td>
                    <td className="p-3 font-mono text-xs">{u.phone_number}</td>
                    <td className="p-3 text-xs text-muted-foreground">{u.course_option}</td>
                    <td className="p-3">
                      {r ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className="size-2.5 rounded-sm" style={{ background: r.color }} />
                          {r.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not spun</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">{u.coupon_code ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No users match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
