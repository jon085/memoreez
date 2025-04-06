import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import RecentMemoriesSection from "@/components/home/recent-memories-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CallToActionSection from "@/components/home/call-to-action-section";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <RecentMemoriesSection />
      <TestimonialsSection />
      <CallToActionSection />
    </div>
  );
};

export default HomePage;
