import { redirect } from "next/navigation";

export default function Page() {
  // Redirect the generic Next.js intro to our login route
  redirect("/login");
}
