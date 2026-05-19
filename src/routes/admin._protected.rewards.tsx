import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { listRewards, resetRewardCounts, setProbabilities, setRewardActive } from "../lib/api/rewards";
import { resetAllSpins } from "../lib/api/users";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { RewardKey } from "../lib/types";

export const Route = createFileRoute("/admin/_protected/rewards")({
  component: RewardsPage,
});

function RewardsPage() {
  const [rewards, setRewards] = useState(listRewards);

  const updateActive = (id: RewardKey, v: boolean) => {
    setRewards(setRewardActive(id, v));
    toast.success(`${id} ${v ? "enabled" : "disabled"}`);
  };

  const updateProb = (id: RewardKey, v: number) => {
    setRewards((curr) => curr.map((r) => (r.id === id ? { ...r, probability: v } : r)));
  };

  const saveProbs = () => {
    const probs = rewards.reduce((acc, r) => ({ ...acc, [r.id]: r.probability }), {} as Record<RewardKey, number>);
    setRewards(setProbabilities(probs));
    toast.success("Probabilities saved");
  };

  const totalWeight = rewards.reduce((s, r) => s + r.probability, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase">Rewards</h1>
        <p className="text-sm text-muted-foreground">Toggle rewards, tune odds, and reset campaign state.</p>
      </div>

      <div className="grid gap-4">
        {rewards.map((r) => {
          const pct = Math.round((r.probability / totalWeight) * 100);
          const isFree = r.id === "FREE";
          const limitReached = r.max_limit > 0 && r.total_won >= r.max_limit;
          return (
            <div key={r.id} className="border rounded-xl bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-sm" style={{ background: r.color }} />
                    <div className="font-bold">{r.reward_name}</div>
                    {isFree && <span className="text-[10px] uppercase bg-brand-coral text-white px-2 py-0.5 rounded-full">Limited</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Won {r.total_won}{r.max_limit > 0 ? ` / ${r.max_limit}` : ""} times · {pct}% odds
                  </div>
                  {limitReached && (
                    <div className="mt-2 text-xs flex items-center gap-1 text-destructive">
                      <AlertTriangle className="size-3" /> Max limit reached — auto-disabled
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{r.is_active ? "Active" : "Disabled"}</span>
                  <Switch checked={r.is_active} onCheckedChange={(v) => updateActive(r.id, v)} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Weight</span><span className="font-mono">{r.probability}</span>
                </div>
                <Slider
                  value={[r.probability]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateProb(r.id, v)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveProbs} className="bg-brand-charcoal hover:bg-brand-charcoal/90">Save probabilities</Button>
        <Button
          variant="outline"
          onClick={() => {
            resetRewardCounts();
            setRewards(listRewards());
            toast.success("Reward counts reset");
          }}
        >
          <RotateCcw className="size-4" /> Reset reward counts
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!confirm("Reset all user spin status? This lets every user spin again.")) return;
            resetAllSpins();
            toast.success("All spin statuses reset");
          }}
        >
          Reset user spins
        </Button>
      </div>
    </div>
  );
}
