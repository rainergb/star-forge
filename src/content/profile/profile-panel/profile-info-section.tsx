import { Mail, CalendarDays, UserX } from "lucide-react";
import { User } from "@/types/auth.types";
import { format } from "date-fns";
import { DetailSection, DetailActionRow } from "@/components/shared/detail-item";

interface ProfileInfoSectionProps {
  user: User;
}

export function ProfileInfoSection({ user }: ProfileInfoSectionProps) {
  const memberSince = user.createdAt
    ? format(new Date(user.createdAt), "MMM d, yyyy")
    : "—";

  const isGuest = user.provider === "guest";

  return (
    <DetailSection>
      <div className="space-y-1">
        {isGuest ? (
          <DetailActionRow
            icon={<UserX className="w-4 h-4" />}
            label="No account — data stored locally"
            clickable={false}
          />
        ) : (
          <DetailActionRow
            icon={<Mail className="w-4 h-4" />}
            label={user.email}
            clickable={false}
          />
        )}
        <DetailActionRow
          icon={<CalendarDays className="w-4 h-4" />}
          label="Member since"
          clickable={false}
          value={<span className="text-white/40 text-sm">{memberSince}</span>}
        />
      </div>
    </DetailSection>
  );
}
