import type { Metadata } from "next";
import { Nova } from "@/components/worlds/nova/Nova";

export const metadata: Metadata = {
  title: "Nova — decision intelligence",
  description:
    "An agent surface where every recommendation shows its reasoning: live runs, confidence, provenance and the action it wants you to take.",
};

export default function Page() {
  return <Nova />;
}
