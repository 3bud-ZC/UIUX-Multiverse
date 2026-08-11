import type { Metadata } from "next";
import { Mercato } from "@/components/worlds/mercato/Mercato";

export const metadata: Metadata = {
  title: "Mercato — provisions and table goods",
  description:
    "A fictional shop that behaves like one: categories, filters, a product page, a working cart drawer and a real checkout summary.",
};

export default function Page() {
  return <Mercato />;
}
