import type { Metadata } from "next";
import { Orbit } from "@/components/worlds/orbit/Orbit";

export const metadata: Metadata = {
  title: "Orbit — Deep Field",
  description:
    "A fictional salvage sim: take a contract, read the hazard, fit the hull inside its power budget and launch.",
};

export default function Page() {
  return <Orbit />;
}
