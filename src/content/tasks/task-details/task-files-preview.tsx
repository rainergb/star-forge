import { useState } from "react";
import { FileText, X, Download, ZoomIn } from "lucide-react";
import { TaskFile } from "@/types/task.types";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  return (
    <div 
      className="fixed inset-0 z-10001 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

interface TaskFilePreviewProps {
  file: TaskFile;
  onRemove: () => void;
}

export function TaskFilePreview({ file, onRemove }: TaskFilePreviewProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const isPdf = file.name.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file.name);

  return (
    <>
      {showLightbox && isImage && (
        <ImageLightbox
          src={file.url}
          alt={file.name}
          onClose={() => setShowLightbox(false)}
        />
      )}
      
      <div className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10">
        {isImage ? (
          <div className="relative">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => setShowLightbox(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                className="p-2 bg-white/20 rounded-full text-white/80 hover:text-white hover:bg-white/30 pointer-events-auto cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <a
                href={file.url}
                download={file.name}
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-white/20 rounded-full text-white/80 hover:text-white hover:bg-white/30 pointer-events-auto"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : isPdf ? (
          <a
            href={file.url}
            download={file.name}
            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-white/70 text-sm truncate flex-1">{file.name}</span>
          </a>
        ) : null}

        {/* File name for images */}
        {isImage && (
          <div className="px-3 py-2 border-t border-white/10">
            <span className="text-white/50 text-xs truncate block">{file.name}</span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </>
  );
}

interface TaskFilesListProps {
  files: TaskFile[];
  onRemoveFile: (fileId: string) => void;
}

export function TaskFilesList({ files, onRemoveFile }: TaskFilesListProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {files.map((file) => (
        <TaskFilePreview
          key={file.id}
          file={file}
          onRemove={() => onRemoveFile(file.id)}
        />
      ))}
    </div>
  );
}
