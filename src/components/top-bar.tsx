import { Sparkles, FileText, Settings } from "lucide-react";

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between bg-linear-to-b from-background/80 to-transparent backdrop-blur-[2px]">
      {/* Logo */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30 group-hover:border-primary/60 transition-colors">
          <Sparkles className="w-5 h-5 text-primary-light" />
        </div>
        <span className="text-xl font-bold text-white tracking-wider font-sans">STAR FORGE</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="cursor-pointer rounded-lg flex items-center gap-2 px-4 py-2 bg-[#0b0d27]/50 border border-white/10 text-text transition-colors hover:bg-primary/10">
          <FileText className="w-4 h-4" />
          <span>Report</span>
        </button>

        <button className="cursor-pointer rounded-lg flex items-center gap-2 px-4 py-2 bg-[#0b0d27]/50 border border-white/10 text-text transition-colors hover:bg-primary/10">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(106,48,255,0.3)]">
          <img 
            src="https://github.com/shadcn.png"
            alt="User" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}
