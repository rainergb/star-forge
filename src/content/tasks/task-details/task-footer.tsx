import { DetailFooter } from "@/components/shared/detail-footer";

interface TaskFooterProps {
  createdAt: number;
  onDelete: () => void;
  onExport: () => void;
}

export function TaskFooter({ createdAt, onDelete, onExport }: TaskFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      onExport={onExport}
      dateFormat="relative"
    />
  );
}
