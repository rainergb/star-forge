import { DetailFooter } from "@/components/shared/detail-footer";

interface DiaryFooterProps {
  createdAt: number;
  updatedAt: number;
  onDelete: () => void;
  onExport: () => void;
}

export function DiaryFooter({
  createdAt,
  updatedAt,
  onDelete,
  onExport
}: DiaryFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      updatedAt={updatedAt}
      onDelete={onDelete}
      onExport={onExport}
      dateFormat="absolute"
      className="px-6 py-4"
    />
  );
}
