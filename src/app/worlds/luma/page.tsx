import type { Metadata } from "next";
import { Luma } from "@/components/worlds/luma/Luma";

export const metadata: Metadata = {
  title: "Luma — light, sleep and daily rhythm",
  description:
    "A fictional consumer mobile app, shown as an app: a working home screen, the rhythm view, the rest planner, onboarding and its real states.",
};

export default function Page() {
  return <Luma />;
}
