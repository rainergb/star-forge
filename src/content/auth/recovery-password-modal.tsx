import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const recoverySchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type RecoveryFormData = z.infer<typeof recoverySchema>;

interface RecoveryPasswordModalProps {
  onChangePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function RecoveryPasswordModal({
  onChangePassword
}: RecoveryPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema)
  });

  const onSubmit = async (data: RecoveryFormData) => {
    setServerError(null);
    const result = await onChangePassword(data.password);
    if (!result.success) {
      setServerError(result.error || "Could not update password. Try again.");
    }
  };

  return (
    /* Overlay por cima do app */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl shadow-primary/10 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Set new password</h2>
          <p className="text-white/50 text-sm mt-1 text-center">
            Choose a strong password for your account
          </p>
        </div>

        {serverError && (
          <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoFocus
                className="pl-10 pr-10 bg-background/50 border-white/10 focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 bg-background/50 border-white/10 focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 mt-2"
          >
            {isSubmitting ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
