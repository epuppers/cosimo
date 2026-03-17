import { redirect } from "react-router";

/** Index route — redirects to /chat */
export function clientLoader() {
  return redirect("/chat");
}

export default function Home() {
  return null;
}
