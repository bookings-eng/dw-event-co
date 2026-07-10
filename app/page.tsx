import Hero from "./components/Hero";
import InfoBar from "./components/InfoBar";
import ImageMarquee from "./components/ImageMarquee";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Hero />
      <InfoBar />
      <ImageMarquee />
      <FAQSection />
      <Footer />
    </div>
  );
}
