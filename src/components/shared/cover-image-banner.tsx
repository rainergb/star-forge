import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverImageBannerProps {
  image: string | null;
  alt: string;
  onUpdateImage: (image: string | null) => void;
  height?: "sm" | "md" | "lg";
  placeholder?: string;
  className?: string;
}

const heightClasses = {
  sm: "h-20",
  md: "h-32",
  lg: "h-40"
};

export function CoverImageBanner({
  image,
  alt,
  onUpdateImage,
  height = "md",
  placeholder = "Add cover image",
  className
}: CoverImageBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt={alt}
            className={cn("w-full object-cover", heightClasses[height])}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => onUpdateImage(null)}
              className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/40 hover:text-white/60 cursor-pointer",
            heightClasses.sm
          )}
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-sm">{placeholder}</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
