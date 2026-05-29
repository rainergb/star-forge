import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotForm } from "./forgot-form";
import { LoginFormData, SignupFormData } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import Particles from "@/components/particles";
import logo from "@/assets/logo.png";

type AuthView = "login" | "signup" | "confirm" | "forgot";

export function LoginScreen() {
  const { login, signup, loginWithGoogle, loginAsGuest, sendPasswordReset } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    const result = await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });

    if (result === false) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setError(null);
    const result = await signup({
      email: data.email,
      password: data.password,
      name: data.name
    });

    if (!result.success) {
      setError(result.error || "Could not create account. Try again.");
      return;
    }

    if (result.needsConfirmation) {
      setConfirmEmail(data.email);
      setView("confirm");
    }
  };

  const subtitles: Record<AuthView, string> = {
    login: "Welcome back! Sign in to continue",
    signup: "Create your account to get started",
    confirm: "Check your email",
    forgot: "Reset your password"
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background">
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={150}
          particleSpread={15}
          speed={0.05}
          particleColors={["#6A30FF", "#8A52FF", "#B57CFF", "#D6B8FF"]}
          moveParticlesOnHover
          particleHoverFactor={1.5}
          alphaParticles
          particleBaseSize={80}
          sizeRandomness={0.8}
          cameraDistance={25}
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/30 to-background/80 z-1" />

      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div
          className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-primary/10"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-xl overflow-hidden border border-white/10 p-3 bg-background/50 mb-4">
              <img
                src={logo}
                alt="Star Habit Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              STAR HABIT
            </h1>
            <p className="text-white/50 text-sm mt-2">
              {subtitles[view]}
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Confirm email view */}
          {view === "confirm" && (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-2">📧</div>
              <p className="text-white/70 text-sm">
                We sent a confirmation link to:
              </p>
              <p className="text-white font-medium">{confirmEmail}</p>
              <p className="text-white/40 text-xs">
                Check your inbox and click the link to activate your account.
              </p>
              <button
                onClick={() => setView("login")}
                className="mt-4 text-primary hover:text-primary/80 text-sm transition-colors cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          )}

          {/* Forgot password view */}
          {view === "forgot" && (
            <ForgotForm
              onSendReset={sendPasswordReset}
              onGoToLogin={() => { setError(null); setView("login"); }}
            />
          )}

          {/* Login view */}
          {view === "login" && (
            <LoginForm
              onSubmit={handleLogin}
              onGoogleLogin={(rememberMe) => loginWithGoogle(rememberMe)}
              onGuestLogin={loginAsGuest}
              onGoToSignup={() => { setError(null); setView("signup"); }}
              onForgotPassword={() => { setError(null); setView("forgot"); }}
            />
          )}

          {/* Signup view */}
          {view === "signup" && (
            <SignupForm
              onSubmit={handleSignup}
              onGoogleLogin={() => loginWithGoogle()}
              onGoToLogin={() => { setError(null); setView("login"); }}
            />
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Star Habit. Forge your destiny.
        </p>
      </div>
    </div>
  );
}
