import { redirect } from "next/navigation";

// The app uses a single combined auth page; /login is kept as an alias.
export default function LoginRedirect() {
  redirect("/auth");
}
