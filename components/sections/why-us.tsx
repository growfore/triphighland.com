import { Heart, Diamond, Banknote, RectangleGoggles } from "lucide-react";

export default function WhyUsSection() {
  const features = [
    {
      icon: Diamond,
      title: "Unrivaled Excellence",
      description:
        "At Summit Luxury, we curate only the most exceptional lodges and experiences, handling every detail so you can focus on the journey.",
    },

    {
      icon: Banknote,
      title: "Exceptional Value",
      description:
        "Exceptional quality meets logistical efficiency. We provide competitive pricing, 24/7 support, and seamless last-minute availability.",
    },
    {
      icon: Heart,
      title: "Curated Discovery",
      description:
        "From hidden mountain trails to vibrant cultural immersions, our itineraries are designed to showcase the authentic soul of the Himalayas.",
    },
    {
      icon: RectangleGoggles,
      title: "Confidence in Quality",
      description:
        "Your satisfaction is our benchmark. We operate with a commitment to excellence that ensures a safe, rewarding, and world-class adventure.",
    },
  ];

  return (
    <section className="bg-primary/20">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 container mx-auto ">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex flex-col p-8">
              <IconComponent className="w-10 h-10 text-primary" />
              <div className="font-bold text-foreground mb-3 uppercase leading-relaxed h-8 mt-4 tracking-wider">
                {feature.title}
              </div>

              <div className="text-muted-foreground text-sm leading-relaxed tracking-wider">
                {feature.description}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
