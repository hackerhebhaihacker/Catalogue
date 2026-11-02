import React from "react";
import Image from "next/image";
import { Target, Eye, Heart, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To deliver premium products with unmatched quality and reliability, empowering our customers to achieve their goals with confidence.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become the most trusted product catalogue platform for professionals and businesses across the globe.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Integrity, innovation and customer-first thinking guide every product selection and business decision we make.",
    color: "bg-purple-50 text-purple-600",
  },
];

const highlights = [
  "ISO-certified quality standards",
  "Dedicated customer support team",
  "Trusted by 10,000+ businesses",
  "Eco-conscious product sourcing",
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[hsl(var(--background))]" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-[hsl(var(--primary))] uppercase">
            Who We Are
          </span>
          <h2
            id="about-heading"
            className="mt-2 text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            About {siteConfig.name}
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            We are a company built on the belief that quality products and
            outstanding service go hand in hand.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Our modern office and team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-5 border border-[hsl(var(--border))]">
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">12+</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Years of Excellence</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
              Building Trust Through Quality
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
              {siteConfig.name} was founded with a simple yet powerful idea: customers
              deserve access to the best products with complete transparency and
              confidence. We carefully curate every item in our catalogue to meet
              the highest standards of quality, durability and value.
            </p>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              Our expert team works tirelessly to evaluate, test and select
              products that genuinely make a difference in your personal and
              professional life. We don't compromise — and neither should you.
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[hsl(var(--foreground))]">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-[hsl(var(--card))] rounded-2xl p-8 border border-[hsl(var(--border))] hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-xl ${pillar.color} mb-5`}>
                <pillar.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">
                {pillar.title}
              </h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
