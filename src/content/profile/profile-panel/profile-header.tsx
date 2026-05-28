import { useRef, useState } from "react";
import { Camera, Pencil, Check, X } from "lucide-react";
import { User } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: User;
  onUpdateAvatar: (avatar: string | null) => void;
  onUpdateName: (name: string) => void;
  onUpdateBio: (bio: string) => void;
}

function getInitials(user: User): string {
  const name = user.name || user.email;
  return name
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileHeader({
  user,
  onUpdateAvatar,
  onUpdateName,
  onUpdateBio
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name ?? "");
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState(user.bio ?? "");

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpdateAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveName = () => {
    if (nameValue.trim()) onUpdateName(nameValue.trim());
    setEditingName(false);
  };

  const cancelName = () => {
    setNameValue(user.name ?? "");
    setEditingName(false);
  };

  const saveBio = () => {
    onUpdateBio(bioValue.trim());
    setEditingBio(false);
  };

  const cancelBio = () => {
    setBioValue(user.bio ?? "");
    setEditingBio(false);
  };

  return (
    <div className="border-b border-white/10 px-5 pt-8 pb-5 flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="relative mb-4">
        <div
          className={cn(
            "w-20 h-20 rounded-2xl overflow-hidden",
            "bg-gradient-to-br from-primary to-purple-700",
            "flex items-center justify-center shrink-0"
          )}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name ?? "avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white select-none">
              {getInitials(user)}
            </span>
          )}
        </div>

        {/* Change avatar button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "absolute -bottom-1 -right-1",
            "w-7 h-7 rounded-lg bg-background border border-white/15",
            "flex items-center justify-center",
            "text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          )}
          title="Change photo"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* Name */}
      <div className="flex items-center gap-2 group justify-center">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") cancelName();
              }}
              autoFocus
              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-lg font-semibold focus:outline-none focus:border-primary/50 text-center w-48"
            />
            <button onClick={saveName} className="text-primary hover:text-primary/80 cursor-pointer">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={cancelName} className="text-white/40 hover:text-white/70 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white">
              {user.name || user.email.split("@")[0]}
            </h2>
            <button
              onClick={() => {
                setNameValue(user.name ?? "");
                setEditingName(true);
              }}
              className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/70 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Bio */}
      <div className="mt-1.5 group w-full">
        {editingBio ? (
          <div className="space-y-2">
            <textarea
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelBio();
              }}
              autoFocus
              placeholder="Write a short bio..."
              rows={2}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-white/70 text-sm focus:outline-none focus:border-primary/50 resize-none placeholder-white/30 text-center"
            />
            <div className="flex justify-center gap-3">
              <button onClick={cancelBio} className="text-white/40 hover:text-white/70 text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={saveBio} className="text-primary hover:text-primary/80 text-xs cursor-pointer">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-1 justify-center">
            <p
              className={cn(
                "text-sm cursor-text",
                user.bio ? "text-white/50" : "text-white/25 italic"
              )}
              onClick={() => {
                setBioValue(user.bio ?? "");
                setEditingBio(true);
              }}
            >
              {user.bio || "Add a bio..."}
            </p>
            {user.bio && (
              <button
                onClick={() => {
                  setBioValue(user.bio ?? "");
                  setEditingBio(true);
                }}
                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/70 transition-all cursor-pointer mt-0.5 shrink-0"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
