import type { Metadata } from "next";
import { Forma } from "@/components/worlds/forma/Forma";

export const metadata: Metadata = {
  title: "Forma — architecture and research",
  description:
    "A fictional architecture studio, published as drawings: plans, sections, dimensions, materials and a works index.",
};

export default function Page() {
  return <Forma />;
}
