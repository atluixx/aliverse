import { redirect } from "next/navigation";

export default function LegacyAdminUsersRedirectPage() {
  redirect("/admin");
}
