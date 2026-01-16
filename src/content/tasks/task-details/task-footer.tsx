import { DetailFooter } from "@/components/shared/detail-footer";

interface TaskFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function TaskFooter({ createdAt, onDelete }: TaskFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      dateFormat="relative"
    />
  );
}
