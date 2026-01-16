import { DetailFooter } from "@/components/shared/detail-footer";

interface DiaryFooterProps {
  createdAt: number;
  updatedAt: number;
  onDelete: () => void;
}

export function DiaryFooter({
  createdAt,
  updatedAt,
  onDelete
}: DiaryFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      updatedAt={updatedAt}
      onDelete={onDelete}
      dateFormat="absolute"
      className="px-6 py-4"
    />
  );
}
