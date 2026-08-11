import type { Metadata } from "next";
import { Vault } from "@/components/worlds/vault/Vault";

export const metadata: Metadata = {
  title: "Vault — treasury operating system",
  description:
    "A fictional treasury workspace: balances, positions, the maturity ladder and the payment queue, at working density.",
};

export default function Page() {
  return <Vault />;
}
