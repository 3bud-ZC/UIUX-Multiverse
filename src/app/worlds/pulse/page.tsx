import type { Metadata } from "next";
import { Pulse } from "@/components/worlds/pulse/Pulse";

export const metadata: Metadata = {
  title: "Pulse — label, radio and live",
  description:
    "A fictional record label: the new release, the catalogue, the tour and the radio, laid out as a gig poster.",
};

export default function Page() {
  return <Pulse />;
}
