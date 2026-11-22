import { AppLoader } from "@/components/flow/AppLoader";
import { Footer } from "@/components/flow/Footer";
import { SeoContent } from "@/components/seo/SeoContent";
import { JsonLd } from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <AppLoader />
      {/* Server-rendered content: readable by search engines and visible below the app */}
      <SeoContent />
      <Footer />
    </>
  );
}
