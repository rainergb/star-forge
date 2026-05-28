import { useAuth } from "@/hooks/use-auth";
import { DetailContainer, DetailContent } from "@/components/shared/detail-item";
import { ProfileHeader } from "./profile-header";
import { ProfileInfoSection } from "./profile-info-section";
import { ProfileStatsSection } from "./profile-stats-section";
import { ProfileActionsSection } from "./profile-actions-section";

interface ProfilePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfilePanel({ open, onOpenChange }: ProfilePanelProps) {
  const { user, updateUser, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    onOpenChange(false);
  };

  return (
    <DetailContainer open={open} onOpenChange={onOpenChange}>
      <DetailContent>
        <ProfileHeader
          user={user}
          onUpdateAvatar={(avatar) => updateUser({ avatar: avatar ?? undefined })}
          onUpdateName={(name) => updateUser({ name })}
          onUpdateBio={(bio) => updateUser({ bio })}
        />

        <ProfileInfoSection user={user} />

        <ProfileStatsSection />

        <ProfileActionsSection onLogout={handleLogout} />
      </DetailContent>
    </DetailContainer>
  );
}
