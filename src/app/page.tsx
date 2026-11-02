import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ContactSection from "@/components/home/ContactSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <ContactSection />
    </>
  );
}
