import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, LogOut, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";
import { useDiary } from "@/hooks/use-diary";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { exportAll } from "@/services/export-service";
import { DetailSection } from "@/components/shared/detail-item";
import { DataImportButton } from "@/content/auth/data-import-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const changePasswordSchema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface ProfileActionsSectionProps {
  onLogout: () => void;
}

export function ProfileActionsSection({ onLogout }: ProfileActionsSectionProps) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { user, changePassword } = useAuth();
  const { toast } = useToast();

  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { skills } = useSkills();
  const { entries } = useDiary();
  const { sessions } = usePomodoroSessions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema)
  });

  const handleExportAll = () => {
    exportAll({ tasks, projects, skills, diary: entries, pomodoro: sessions });
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    const result = await changePassword(data.password);
    if (result.success) {
      toast({ title: "Password updated", description: "Your password was changed successfully." });
      reset();
      setChangingPassword(false);
      setShowPassword(false);
      setShowConfirm(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not update password.",
        variant: "destructive"
      });
    }
  };

  const isEmailUser = user?.provider === "email";

  return (
    <>
      {/* Data */}
      <DetailSection>
        <DataImportButton onImportSuccess={() => {}} />
      </DetailSection>

      <DetailSection>
        <button
          onClick={handleExportAll}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-white/40" />
          <span>Export all data</span>
          <span className="ml-auto text-xs text-white/30">Full backup</span>
        </button>
      </DetailSection>

      {/* Change password — apenas para usuários de email */}
      {isEmailUser && (
        <DetailSection>
          <button
            onClick={() => {
              setChangingPassword(!changingPassword);
              reset();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 text-white/40" />
            <span>Change password</span>
            <span className="ml-auto text-white/30">
              {changingPassword
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {changingPassword && (
            <form
              onSubmit={handleSubmit(handleChangePassword)}
              className="mt-2 space-y-3 px-1"
            >
              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoFocus
                    className="pl-9 pr-9 py-1.5 text-sm bg-background/50 border-white/10 focus:border-primary/50 h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 py-1.5 text-sm bg-background/50 border-white/10 focus:border-primary/50 h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setChangingPassword(false); reset(); }}
                  className="flex-1 px-3 py-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DetailSection>
      )}

      {/* Danger zone */}
      <DetailSection className="border-b-0">
        {!confirmLogout ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-3">
            <p className="text-sm text-red-300">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 px-3 py-1.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-3 py-1.5 text-sm bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </DetailSection>
    </>
  );
}
