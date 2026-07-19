import Layout from "@/layouts/Layout";

import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Guide from "@/components/sections/Guide";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";

import { useSeo } from "@/hooks/useSeo";

export default function IndexPage() {
  useSeo(
    "TripFlow - Planifica tus viajes del futuro",
    "TripFlow: planifica tus viajes con itinerarios generados por IA, optimización de rutas, colaboración en tiempo real y acceso offline."
  );

  return (
    <Layout>
      <Hero />
      <Features />
      <Guide />
      <Faq />
      <Cta />
    </Layout>
  );
}
