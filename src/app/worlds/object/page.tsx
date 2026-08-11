import type { Metadata } from "next";
import { ObjectWorld } from "@/components/worlds/object/ObjectWorld";

export const metadata: Metadata = {
  title: "أثير — أرشيف الإذاعة والطرب القديم",
  description:
    "مِذياع خشبي وخمس محطّات على قرصٍ واحد: أدِر التوليف لتنتقل بين العقود، فتتغيّر المحطّة وخريطة الإرسال والأرشيف وضوء الغرفة.",
};

export default function Page() {
  return <ObjectWorld />;
}
