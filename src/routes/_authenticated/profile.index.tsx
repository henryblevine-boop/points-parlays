import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProfileView } from "@/components/profile-view";
import { useSessionUser } from "@/hooks/use-session-user";
import { profileQuery, betsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/profile/")({
  head: () => ({
    meta: [
      { title: "My Profile — ParlayPals" },
      {
        name: "description",
        content: "Your ParlayPals record, points total and full bet history.",
      },
      { property: "og:title", content: "My Profile — ParlayPals" },
      { property: "og:description", content: "Your record, points total and bet history." },
    ],
  }),
  component: MyProfile,
});

function MyProfile() {
  const { user } = useSessionUser();
  const userId = user?.id ?? "";
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const { data: bets = [] } = useQuery({ ...betsQuery({ userId }), enabled: Boolean(userId) });

  return <ProfileView profile={profile ?? null} bets={bets} isSelf />;
}
