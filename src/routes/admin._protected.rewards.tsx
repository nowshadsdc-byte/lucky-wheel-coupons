import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { listRewards, resetRewardCounts, setProbabilities, setRewardActive, createReward, updateReward, deleteReward } from "../lib/api/rewards";
import { resetAllSpins } from "../lib/api/users";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertTriangle, RotateCcw, Plus, Trash2, Edit2 } from "lucide-react";
import type { RewardKey, Reward } from "../lib/types";

export const Route = createFileRoute("/admin/_protected/rewards")({
  component: RewardsPage,
});

const PRESET_COLORS = [
  "var(--brand-coral)",
  "var(--brand-orange)",
  "var(--brand-teal)",
  "var(--brand-green)",
  "#9333ea",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
];

function RewardsPage() {
  const [rewards, setRewards] = useState(listRewards);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({ name: "", label: "", color: PRESET_COLORS[0], probability: 10, max_limit: 0 });

  const updateActive = (id: RewardKey, v: boolean) => {
    setRewards(setRewardActive(id, v));
    toast.success(`${id} ${v ? "enabled" : "disabled"}`);
  };

  const updateProb = (id: RewardKey, v: number) => {
    setRewards((curr) => curr.map((r) => (r.id === id ? { ...r, probability: v } : r)));
  };

  const saveProbs = () => {
    const probs = rewards.reduce((acc, r) => ({ ...acc, [r.id]: r.probability }), {} as Record<string, number>);
    setRewards(setProbabilities(probs));
    toast.success("Probabilities saved");
  };

  const handleAddReward = () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      toast.error("Please fill in reward name and label");
      return;
    }
    try {
      createReward(formData.name, formData.label, formData.color, formData.probability, formData.max_limit);
      setRewards(listRewards());
      setFormData({ name: "", label: "", color: PRESET_COLORS[0], probability: 10, max_limit: 0 });
      setIsCreateDialogOpen(false);
      toast.success("Reward created successfully");
    } catch (e) {
      toast.error("Failed to create reward");
    }
  };

  const handleUpdateReward = () => {
    if (!editingReward || !formData.name.trim() || !formData.label.trim()) {
      toast.error("Please fill in reward name and label");
      return;
    }
    try {
      updateReward(editingReward.id, {
        reward_name: formData.name,
        label: formData.label,
        color: formData.color,
        probability: formData.probability,
        max_limit: formData.max_limit,
      });
      setRewards(listRewards());
      setEditingReward(null);
      setFormData({ name: "", label: "", color: PRESET_COLORS[0], probability: 10, max_limit: 0 });
      toast.success("Reward updated successfully");
    } catch (e) {
      toast.error("Failed to update reward");
    }
  };

  const handleDeleteReward = (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    if (deleteReward(id)) {
      setRewards(listRewards());
      toast.success("Reward deleted");
    } else {
      toast.error("Failed to delete reward");
    }
  };

  const openEditDialog = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.reward_name,
      label: reward.label,
      color: reward.color,
      probability: reward.probability,
      max_limit: reward.max_limit,
    });
  };

  const totalWeight = rewards.reduce((s, r) => s + r.probability, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase">Rewards</h1>
          <p className="text-sm text-muted-foreground">Toggle rewards, tune odds, and reset campaign state.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-coral hover:bg-brand-coral/90">
              <Plus className="size-4" /> Add New Reward
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Reward</DialogTitle>
              <DialogDescription>Add a new reward that will appear on the spin wheel.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Reward Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. 50% OFF"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="label">Wheel Label (short)</Label>
                <Input
                  id="label"
                  placeholder="e.g. 50% OFF"
                  maxLength={12}
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      className="w-full h-8 rounded-md border-2 cursor-pointer transition"
                      style={{
                        background: c,
                        borderColor: formData.color === c ? "var(--brand-charcoal)" : "transparent",
                      }}
                      onClick={() => setFormData({ ...formData, color: c })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="prob">Weight (higher = more likely)</Label>
                <Input
                  id="prob"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="limit">Max Limit (0 = unlimited)</Label>
                <Input
                  id="limit"
                  type="number"
                  min="0"
                  value={formData.max_limit}
                  onChange={(e) => setFormData({ ...formData, max_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button onClick={handleAddReward} className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90">
                Create Reward
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingReward} onOpenChange={(open) => !open && setEditingReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>Update the reward details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Reward Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g. 50% OFF"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-label">Wheel Label (short)</Label>
              <Input
                id="edit-label"
                placeholder="e.g. 50% OFF"
                maxLength={12}
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-full h-8 rounded-md border-2 cursor-pointer transition"
                    style={{
                      background: c,
                      borderColor: formData.color === c ? "var(--brand-charcoal)" : "transparent",
                    }}
                    onClick={() => setFormData({ ...formData, color: c })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-prob">Weight (higher = more likely)</Label>
              <Input
                id="edit-prob"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-limit">Max Limit (0 = unlimited)</Label>
              <Input
                id="edit-limit"
                type="number"
                min="0"
                value={formData.max_limit}
                onChange={(e) => setFormData({ ...formData, max_limit: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleUpdateReward} className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {rewards.map((r) => {
          const pct = Math.round((r.probability / totalWeight) * 100);
          const isFree = r.id === "FREE";
          const isCustom = r.id.startsWith("CUSTOM_");
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
                  {isCustom && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(r)}
                        className="ml-2"
                      >
                        <Edit2 className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReward(r.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </>
                  )}
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

