import { useState, ReactNode } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos base
interface BaseItem {
  id: string;
  name: string;
  color?: string;
}

// Props para single select
interface SingleSelectProps<T extends BaseItem> {
  multiple?: false;
  items: T[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  icon: ReactNode;
  placeholder?: string;
  emptyText?: string;
  noneLabel?: string;
  createLabel?: string;
  onCreate?: (name: string) => string;
  renderItemIcon?: (item: T) => ReactNode;
  className?: string;
}

// Props para multi select
interface MultiSelectProps<T extends BaseItem> {
  multiple: true;
  items: T[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  icon: ReactNode;
  placeholder?: string;
  emptyText?: string;
  createLabel?: string;
  onCreate?: (name: string) => string;
  renderItemIcon?: (item: T) => ReactNode;
  renderSelectedItem?: (item: T, onRemove: () => void) => ReactNode;
  className?: string;
}

type DropdownSelectorProps<T extends BaseItem> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

export function DropdownSelector<T extends BaseItem>(
  props: DropdownSelectorProps<T>
) {
  const {
    items,
    icon,
    placeholder = "Select...",
    emptyText = "No items available",
    createLabel = "Create new",
    onCreate,
    renderItemIcon,
    className
  } = props;

  const [showMenu, setShowMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const isMultiple = props.multiple === true;

  // Helpers para single/multi
  const isSelected = (id: string) => {
    if (isMultiple) {
      return (props as MultiSelectProps<T>).selected.includes(id);
    }
    return (props as SingleSelectProps<T>).selected === id;
  };

  const handleSelect = (id: string | null) => {
    if (isMultiple) {
      const multiProps = props as MultiSelectProps<T>;
      if (id === null) {
        multiProps.onSelect([]);
      } else if (multiProps.selected.includes(id)) {
        multiProps.onSelect(multiProps.selected.filter((i) => i !== id));
      } else {
        multiProps.onSelect([...multiProps.selected, id]);
      }
    } else {
      (props as SingleSelectProps<T>).onSelect(id);
      setShowMenu(false);
    }
  };

  const handleCreate = () => {
    if (newItemName.trim() && onCreate) {
      const newId = onCreate(newItemName.trim());
      if (isMultiple) {
        const multiProps = props as MultiSelectProps<T>;
        multiProps.onSelect([...multiProps.selected, newId]);
      } else {
        (props as SingleSelectProps<T>).onSelect(newId);
        setShowMenu(false);
      }
      setIsCreating(false);
      setNewItemName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewItemName("");
    }
  };

  // Render do trigger
  const renderTrigger = () => {
    if (isMultiple) {
      const multiProps = props as MultiSelectProps<T>;
      const selectedItems = multiProps.selected
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as T[];

      return (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          {icon}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {selectedItems.length > 0 ? (
              multiProps.renderSelectedItem ? (
                selectedItems.map((item) =>
                  multiProps.renderSelectedItem!(item, () =>
                    handleSelect(item.id)
                  )
                )
              ) : (
                selectedItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary"
                  >
                    {item.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.id);
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )
            ) : (
              <span className="text-white/70 text-sm">{placeholder}</span>
            )}
          </div>
          {selectedItems.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
              className="text-white/30 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>
      );
    } else {
      const singleProps = props as SingleSelectProps<T>;
      const selectedItem = singleProps.selected
        ? items.find((i) => i.id === singleProps.selected)
        : null;

      return (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          {selectedItem && renderItemIcon ? renderItemIcon(selectedItem) : icon}
          <span className="text-white/70 text-sm">
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          {selectedItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
              className="ml-auto text-white/30 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>
      );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {renderTrigger()}

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-none">
            <div className="py-1">
              {/* None option (single select only) */}
              {!isMultiple && (props as SingleSelectProps<T>).noneLabel && (
                <>
                  <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                      !(props as SingleSelectProps<T>).selected
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    {icon}
                    <span>{(props as SingleSelectProps<T>).noneLabel}</span>
                    {!(props as SingleSelectProps<T>).selected && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                  {items.length > 0 && (
                    <div className="border-t border-white/10 my-1" />
                  )}
                </>
              )}

              {/* Items */}
              {items.length > 0 ? (
                items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                      isSelected(item.id)
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    {renderItemIcon ? (
                      renderItemIcon(item)
                    ) : item.color ? (
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                    ) : null}
                    <span className="truncate flex-1">{item.name}</span>
                    {isSelected(item.id) && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-white/40 text-sm">
                  {emptyText}
                </div>
              )}

              {/* Create new */}
              {onCreate && (
                <>
                  <div className="border-t border-white/10 my-1" />
                  {isCreating ? (
                    <div className="px-3 py-2">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Name..."
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleCreate}
                          disabled={!newItemName.trim()}
                          className="flex-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => {
                            setIsCreating(false);
                            setNewItemName("");
                          }}
                          className="px-2 py-1 text-white/50 text-xs hover:text-white/70 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{createLabel}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
