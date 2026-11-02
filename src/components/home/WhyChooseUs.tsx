import React from "react";
import { Shield, Zap, HeartHandshake, Star, Award, Clock } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description:
      "Every product in our catalogue is rigorously tested and meets our strict quality standards before listing.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description:
      "Count on timely delivery and consistent product availability backed by our robust supply chain network.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description:
      "Our dedicated support team is available to help you find the right product for your unique needs.",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: Star,
    title: "Premium Selection",
    description:
      "We curate only the best — hand-picked products from trusted manufacturers and industry leaders.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Award,
    title: "Certified Excellence",
    description:
      "Our business holds multiple industry certifications, ensuring you receive nothing but the best.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Clock,
    title: "Always Available",
    description:
      "Browse our catalogue 24/7 and access your account from any device, anywhere in the world.",
    color: "text-indigo-600 bg-indigo-50",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 bg-[hsl(var(--background))]" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-[hsl(var(--primary))] uppercase">
            Why Us
          </span>
          <h2
            id="why-heading"
            className="mt-2 text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            Why Choose Us?
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            We go beyond simply listing products. Our commitment to excellence
            sets us apart from the competition.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-xl ${reason.color} mb-5 group-hover:scale-110 transition-transform`}>
                <reason.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">
                {reason.title}
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
