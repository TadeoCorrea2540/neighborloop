import CheckInClient from "@/components/check-in/check-in-client";

export const dynamic = "force-dynamic";

export default function CheckInTokenPage({ params }: { params: { token: string } }) {
  return <CheckInClient token={params.token} />;
}
