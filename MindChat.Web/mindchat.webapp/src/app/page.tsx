import { redirect } from "next/navigation";

export default function Page() {
  // Redirect default intro page to our login screen
  redirect("/login");
}
