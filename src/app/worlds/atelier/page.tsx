import type { Metadata } from "next";
import { Atelier } from "@/components/worlds/atelier/Atelier";

export const metadata: Metadata = {
  title: "مِجاز — ديوانٌ ومعرضٌ للشِّعر العربي",
  description:
    "بيتٌ للشِّعر العربي: أبياتٌ تُكتَب أمامك، وخمسة دواوين، والبحر مُقَطَّعًا إلى تفعيلاته، ومعرضٌ مُذَهَّب، وغرفة قراءة.",
};

export default function Page() {
  return <Atelier />;
}
