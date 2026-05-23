import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createUser, getUserByPhone } from "../lib/api/users";
import { store } from "../lib/api/store";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sparkles, Gift, Trophy, Percent } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spin & Win — Skills Development Centre" },
      { name: "description", content: "Register now to spin the wheel and win up to 100% off your next course at SDC." },
    ],
  }),
  component: LandingPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone_number: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+()\-\s\d]+$/, "Only digits, spaces and +()- are allowed"),
  address: z.string().trim().min(4, "Please enter your address").max(200),
  course_option: z.string().trim().min(2, "Required").max(80),
});

type FormValues = z.infer<typeof schema>;

function LandingPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      course_option: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    try {
      if (getUserByPhone(values.phone_number)) {
        toast.error("This phone number has already been used.");
        return;
      }
      const user = createUser(values);
      store.setCurrentUserId(user.id);
      toast.success("Registered! Spin the wheel to claim your reward.");
      navigate({ to: "/spin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-57px)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-coral blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-teal blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-charcoal text-white px-3 py-1 text-xs uppercase tracking-widest">
            <Sparkles className="size-3.5" /> Limited Campaign
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold uppercase">
            Spin <span className="text-brand-coral">&</span> Win
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Register your details, spin the SDC reward wheel, and instantly unlock a coupon for your next course — up to <strong>100% OFF</strong>.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: Trophy, label: "100% FREE", c: "bg-brand-coral" },
              { icon: Percent, label: "30% OFF", c: "bg-brand-orange" },
              { icon: Percent, label: "20% OFF", c: "bg-brand-teal" },
              { icon: Gift, label: "10% OFF", c: "bg-brand-green" },
            ].map(({ icon: Icon, label, c }) => (
              <div key={label} className={`${c} rounded-xl p-4 text-white flex flex-col items-center gap-1.5`}>
                <Icon className="size-6" />
                <div className="font-display font-bold text-sm uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-card border rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold uppercase">Register to Spin</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Each phone number can register and spin once. Choose one course option.
          </p>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Field label="Full Name" error={form.formState.errors.full_name?.message}>
              <Input placeholder="Nowshad" {...form.register("full_name")} />
            </Field>
            <Field label="Phone Number" error={form.formState.errors.phone_number?.message}>
              <Input type="tel" placeholder="+8801722131610" {...form.register("phone_number")} />
            </Field>
            <Field label="Address" error={form.formState.errors.address?.message}>
              <Textarea rows={2} placeholder="Street, city, country" {...form.register("address")} />
            </Field>
            <Field label="Course Option" error={form.formState.errors.course_option?.message}>
              <Select
                value={form.watch("course_option")}
                onValueChange={(value) => form.setValue("course_option", value, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business & Marketing with AI">Business & Marketing with AI</SelectItem>
                  <SelectItem value="Web Development Course">Web Development Course</SelectItem>
                  <SelectItem value="AI Coding Course">AI Coding Course</SelectItem>
                  <SelectItem value="Unreal Engine Online Training Courses">Unreal Engine Online Training Courses</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button
              type="submit"
              size="lg"
              className="w-full uppercase font-bold tracking-wide bg-brand-coral hover:bg-brand-coral/90 text-white"
              disabled={form.formState.isSubmitting}
            >
              <Sparkles className="size-4" /> Register & Spin
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
