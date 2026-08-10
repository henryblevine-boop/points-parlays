import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProfileView } from "@/components/profile-view";
import { FriendButton } from "@/components/friend-button";
import { profileQuery, betsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/profile/$userId")({
  head: () => ({
    meta: [
      { title: "Member Profile — ParlayPals" },
      {
        name: "description",
        content: "A ParlayPals member's betting record, points total and recent slips.",
      },
      { property: "og:title", content: "Member Profile — ParlayPals" },
      {
        property: "og:description",
        content: "A member's betting record, points total and recent slips.",
      },
    ],
  }),
  component: MemberProfile,
});

function MemberProfile() {
  const { userId } = Route.useParams();
  const { data: profile } = useQuery(profileQuery(userId));
  const { data: bets = [] } = useQuery(betsQuery({ userId }));

  return (
    <ProfileView
      profile={profile ?? null}
      bets={bets}
      headerAction={<FriendButton targetUserId={userId} />}
    />
  );
}
