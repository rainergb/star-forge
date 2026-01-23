import { LoginForm } from "./login-form";
import { LoginFormData } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import Particles from "@/components/particles";
import logo from "@/assets/logo.png";

export function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = (data: LoginFormData) => {
    login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
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
              Welcome back! Sign in to continue
            </p>
          </div>

          <LoginForm onSubmit={handleSubmit} onGoogleLogin={handleGoogleLogin} />
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Star Habit. Forge your destiny.
        </p>
      </div>
    </div>
  );
}
