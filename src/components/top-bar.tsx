import { useState } from "react";
import { FileText, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import { SettingsModal } from "@/content/config/settings";

export function TopBar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const actions = [
    // {
    //   label: "Report",
    //   icon: <FileText className="w-4 h-4" />,
    //   onClick: () => {}
    // },
    {
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => setIsSettingsOpen(true)
    }
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-8 py-6  flex items-center justify-between bg-linear-to-b from-background/80 to-transparent backdrop-blur-[2px] ">
      {/* Logo */}

      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="rounded-md overflow-hidden border p-2 hover:bg-primary/10">
          <img
            src={logo}
            alt="Star Forge Logo"
            className="w-6 h-6 object-contain"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-wider font-sans">
          STAR FORGE
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="cursor-pointer rounded-lg flex items-center gap-2 px-4 py-2 bg-background/50 border border-white/10 text-text transition-colors hover:bg-primary/10"
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(106,48,255,0.3)]">
          <img
            src="https://github.com/shadcn.png"
            alt="User"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
