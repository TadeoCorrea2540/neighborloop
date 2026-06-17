import OrgShell from "@/components/org-shell";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrgShell>{children}</OrgShell>;
}
