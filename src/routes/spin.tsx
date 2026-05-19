import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SpinWheel } from "../components/SpinWheel";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { store } from "../lib/api/store";
import { listRewards } from "../lib/api/rewards";
import { getUserById } from "../lib/api/users";
import { spinForUser } from "../lib/spin-engine";
import type { Reward, RewardKey, User } from "../lib/types";
import { Copy, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/spin")({
  head: () => ({ meta: [{ title: "Spin The Wheel — SDC" }] }),
  component: SpinPage,
});

function SpinPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [targetId, setTargetId] = useState<RewardKey | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{ reward: Reward; coupon: string } | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const id = store.getCurrentUserId();
    const u = id ? getUserById(id) : null;
    if (!u) {
      navigate({ to: "/" });
      return;
    }
    setUser(u);
    setRewards(listRewards());
    if (u.has_spun && u.reward_won && u.coupon_code) {
      const r = listRewards().find((x) => x.id === u.reward_won);
      if (r) {
        setResult({ reward: r, coupon: u.coupon_code });
        setTargetId(u.reward_won);
      }
    }
  }, [navigate]);

  const existingCoupons = useMemo(() => {
    return new Set(store.getUsers().map((u) => u.coupon_code).filter(Boolean) as string[]);
  }, [spinning]);

  const handleSpin = () => {
    if (!user || spinning || user.has_spun) return;
    try {
      const { reward, coupon } = spinForUser(user, existingCoupons);
      setSpinning(true);
      setResult({ reward, coupon });
      setTargetId(reward.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Spin failed");
    }
  };

  const handleSpinComplete = () => {
    setSpinning(false);
    setResultOpen(true);
    fireConfetti();
    if (user) setUser({ ...user, has_spun: true });
  };

  if (!user || !rewards.length) return null;

  return (
    <main className="container mx-auto px-4 py-10 md:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold uppercase">
          Hi {user.full_name.split(" ")[0]}, <span className="text-brand-coral">spin to win!</span>
        </h1>
        <p className="text-muted-foreground mt-2">You get one spin. Good luck!</p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-8">
        <SpinWheel rewards={rewards} targetRewardId={targetId} onSpinComplete={handleSpinComplete} />
        {!user.has_spun ? (
          <Button
            size="lg"
            onClick={handleSpin}
            disabled={spinning}
            className="px-10 py-6 text-base uppercase font-bold tracking-wider bg-brand-charcoal hover:bg-brand-charcoal/90 text-white"
          >
            {spinning ? "Spinning…" : "Spin The Wheel"}
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={() => setResultOpen(true)} className="uppercase font-bold">
            View My Reward
          </Button>
        )}
      </div>

      <ResultDialog open={resultOpen} onOpenChange={setResultOpen} result={result} />
    </main>
  );
}

function ResultDialog({
  open, onOpenChange, result,
}: { open: boolean; onOpenChange: (v: boolean) => void; result: { reward: Reward; coupon: string } | null }) {
  if (!result) return null;
  const copy = () => {
    navigator.clipboard.writeText(result.coupon);
    toast.success("Coupon copied to clipboard");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full" style={{ background: result.reward.color }}>
            <PartyPopper className="size-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold uppercase">
            You Won {result.reward.reward_name}!
          </DialogTitle>
          <DialogDescription>
            Use the coupon below to claim your reward. Keep it safe — it's tied to your phone number.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your Coupon</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-brand-charcoal/30 bg-secondary px-4 py-3 font-display text-xl font-bold tracking-wider">
            {result.coupon}
            <button onClick={copy} className="ml-1 text-muted-foreground hover:text-foreground" aria-label="Copy coupon">
              <Copy className="size-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Contact SDC to redeem your offer. Thank you for participating!
          </p>
          <Link to="/" className="mt-6 inline-block text-sm underline text-muted-foreground">Back to home</Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function fireConfetti() {
  const end = Date.now() + 1200;
  const colors = ["#E84A4A", "#F27A41", "#25B2A1", "#4CB963"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
