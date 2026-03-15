import { redirect } from "react-router";

/** Index route — redirects to /chat */
export function loader() {
  return redirect("/chat");
}

export default function Home() {
  return null;
}
