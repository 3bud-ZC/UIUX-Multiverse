import type { Metadata } from "next";
import { Signal } from "@/components/worlds/signal/Signal";

export const metadata: Metadata = {
  title: "شَرارة — لعبة تعليمية عربية للأطفال",
  description:
    "أربعة عوالم للتعلّم باللعب: الحروف والأرقام والفضاء والبحر، مع شلّة من الشخصيات، بلا إعلانات وبلا إنترنت.",
};

export default function Page() {
  return <Signal />;
}
