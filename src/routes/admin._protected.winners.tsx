import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listUsers, markClaimed } from "../lib/api/users";
import { listRewards } from "../lib/api/rewards";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/_protected/winners")({
  component: WinnersPage,
});

function WinnersPage() {
  const [users, setUsers] = useState(listUsers);
  const rewards = listRewards();
  const [query, setQuery] = useState("");

  const winners = useMemo(
    () => users.filter((u) => u.reward_won && (
      !query ||
      u.coupon_code?.toLowerCase().includes(query.toLowerCase()) ||
      u.phone_number.includes(query) ||
      u.full_name.toLowerCase().includes(query.toLowerCase())
    )),
    [users, query],
  );

  const toggleClaim = (id: string, claimed: boolean) => {
    markClaimed(id, claimed);
    setUsers(listUsers());
    toast.success(claimed ? "Marked as claimed" : "Marked as unclaimed");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold uppercase">Winners</h1>
        <p className="text-sm text-muted-foreground">Verify coupons and mark them claimed.</p>
      </div>
      <Input
        placeholder="Search by coupon, phone, or name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Name / Phone</th>
                <th className="text-left p-3">Reward</th>
                <th className="text-left p-3">Coupon</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((u) => {
                const r = rewards.find((x) => x.id === u.reward_won);
                return (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{u.phone_number}</div>
                    </td>
                    <td className="p-3">
                      {r && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className="size-2.5 rounded-sm" style={{ background: r.color }} />
                          {r.label}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">{u.coupon_code}</td>
                    <td className="p-3">
                      {u.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-green font-semibold">
                          <Check className="size-3.5" /> Claimed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.claimed ? (
                        <Button size="sm" variant="ghost" onClick={() => toggleClaim(u.id, false)}>
                          <X className="size-3.5" /> Undo
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => toggleClaim(u.id, true)} className="bg-brand-green hover:bg-brand-green/90 text-white">
                          <Check className="size-3.5" /> Mark claimed
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {winners.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No winners yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
