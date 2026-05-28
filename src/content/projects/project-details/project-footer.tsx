import { DetailFooter } from "@/components/shared/detail-footer";

interface ProjectFooterProps {
  createdAt: number;
  onDelete: () => void;
  onExport: () => void;
}

export function ProjectFooter({ createdAt, onDelete, onExport }: ProjectFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      onExport={onExport}
      dateFormat="relative"
    />
  );
}
