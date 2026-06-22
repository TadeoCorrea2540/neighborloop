import { redirect } from "next/navigation";

// The app uses a single combined auth page; /signup is kept as an alias.
export default function SignupRedirect() {
  redirect("/auth");
}
