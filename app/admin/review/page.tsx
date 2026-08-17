import { redirect } from "next/navigation";

export default function LegacyAdminReviewRedirectPage() {
  redirect("/admin");
}
