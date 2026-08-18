import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { ProfileForm } from "./ProfileForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserWithProfile();

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
