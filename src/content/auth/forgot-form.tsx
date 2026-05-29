import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address")
});

type ForgotFormData = z.infer<typeof forgotSchema>;

interface ForgotFormProps {
  onSendReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  onGoToLogin: () => void;
}

export function ForgotForm({ onSendReset, onGoToLogin }: ForgotFormProps) {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormData) => {
    setServerError(null);
    const result = await onSendReset(data.email);
    if (!result.success) {
      setServerError(result.error || "Could not send reset email. Try again.");
      return;
    }
    setSentEmail(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-12 h-12 text-primary/70" />
        </div>
        <div className="space-y-1.5">
          <p className="text-white font-medium">Check your inbox</p>
          <p className="text-white/50 text-sm">We sent a password reset link to:</p>
          <p className="text-primary text-sm font-medium">{sentEmail}</p>
        </div>
        <p className="text-white/35 text-xs leading-relaxed">
          Click the link in the email to reset your password.
          {" "}It will open in your browser.
        </p>
        <button
          onClick={onGoToLogin}
          className="mt-2 text-primary hover:text-primary/80 text-sm transition-colors cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5 mb-6">
        <p className="text-white/60 text-sm text-center leading-relaxed">
          Enter your email and we'll send a link to reset your password.
        </p>
      </div>

      {serverError && (
        <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            {...register("email")}
            type="email"
            placeholder="your@email.com"
            autoFocus
            className="pl-10 bg-background/50 border-white/10 focus:border-primary/50"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5"
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <button
        type="button"
        onClick={onGoToLogin}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </button>
    </form>
  );
}
