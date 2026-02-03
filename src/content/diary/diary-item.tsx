import { Trash2, Tag, FileText, Image, Clock } from "lucide-react";
import { DiaryEntry, ENTRY_TYPE_CONFIG } from "@/types/diary.types";
import { MoodDisplay } from "./mood-selector";
import { EmotionDisplay } from "./emotion-selector";
import { FavoriteButton } from "@/components/shared/favorite-button";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  useContextMenu
} from "@/components/shared/context-menu";
import {
  ListItem,
  ListItemTitle,
  ListItemMeta,
  ListItemStat
} from "@/components/shared/list-item";

interface DiaryItemProps {
  entry: DiaryEntry;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClick: () => void;
  onDoubleClick?: () => void;
}

export function DiaryItem({
  entry,
  onToggleFavorite,
  onRemove,
  onClick,
  onDoubleClick
}: DiaryItemProps) {
  const { position: contextMenu, handleContextMenu, close: closeContextMenu } = useContextMenu();
  const typeConfig = ENTRY_TYPE_CONFIG[entry.type];
  const hasFiles = entry.files.length > 0;
  const hasImages = entry.files.some((f) => f.type === "image");

  const handleDelete = () => {
    onRemove(entry.id);
    closeContextMenu();
  };

  return (
    <>
      <ListItem
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        coverImage={entry.image}
        leading={
          <div className="flex flex-col items-center gap-1">
            {entry.time && (
              <span className="text-xs text-white/40 font-mono">
                {entry.time}
              </span>
            )}
            <span className="text-lg" title={typeConfig.label}>
              {typeConfig.icon}
            </span>
          </div>
        }
        trailing={
          <FavoriteButton
            isFavorite={entry.favorite}
            onToggle={(e) => {
              e?.stopPropagation();
              onToggleFavorite(entry.id);
            }}
            color="yellow"
          />
        }
      >
        <ListItemTitle>{entry.content}</ListItemTitle>
        <ListItemMeta>
          {entry.mood && (
            <MoodDisplay mood={entry.mood.level} showLabel size="sm" />
          )}

          {entry.mood?.emotions && entry.mood.emotions.length > 0 && (
            <EmotionDisplay
              emotions={entry.mood.emotions}
              size="sm"
              maxDisplay={3}
            />
          )}

          {entry.tags.length > 0 && (
            <ListItemStat icon={<Tag className="w-3 h-3" />}>
              {entry.tags.slice(0, 3).join(", ")}
              {entry.tags.length > 3 && ` +${entry.tags.length - 3}`}
            </ListItemStat>
          )}

          {hasFiles && (
            <ListItemStat
              icon={
                hasImages ? (
                  <Image className="w-3 h-3" />
                ) : (
                  <FileText className="w-3 h-3" />
                )
              }
            >
              {entry.files.length}
            </ListItemStat>
          )}

          {entry.linkedTaskId && (
            <ListItemStat
              icon={<Clock className="w-3 h-3" />}
              color="text-primary/70"
            >
              Linked task
            </ListItemStat>
          )}
        </ListItemMeta>
      </ListItem>

      {contextMenu && (
        <ContextMenu position={contextMenu} onClose={closeContextMenu}>
          <ContextMenuItem
            icon={
              <FavoriteButton
                isFavorite={entry.favorite}
                onToggle={() => {}}
                size="sm"
                color="yellow"
              />
            }
            label={
              entry.favorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => {
              onToggleFavorite(entry.id);
              closeContextMenu();
            }}
          />
          <ContextMenuDivider />
          <ContextMenuItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete entry"
            onClick={handleDelete}
            variant="danger"
          />
        </ContextMenu>
      )}
    </>
  );
}
