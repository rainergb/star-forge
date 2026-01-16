import { DetailFooter } from "@/components/shared/detail-footer";

interface ProjectFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function ProjectFooter({ createdAt, onDelete }: ProjectFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      dateFormat="relative"
    />
  );
}
