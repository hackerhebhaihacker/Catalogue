import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const pillars = [
  {
    title: "Our Mission",
    description: "Deliver premium products with unmatched quality and reliability, empowering customers to achieve their goals with confidence.",
    accent: "bg-blue-600",
  },
  {
    title: "Our Vision",
    description: "Become the most trusted product catalogue for professionals and businesses across India.",
    accent: "bg-indigo-600",
  },
  {
    title: "Our Values",
    description: "Integrity, innovation and customer-first thinking guide every product selection and business decision we make.",
    accent: "bg-violet-600",
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
    <section id="about" className="py-24 bg-white" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Who We Are</span>
          <h2 id="about-heading" className="mt-3 text-4xl font-extrabold text-slate-900 tracking-tight">
            About {siteConfig.name}
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A company built on the belief that quality products and outstanding service go hand in hand.
          </p>
        </div>

        {/* Two-column */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Our modern office"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-6 py-5">
              <div className="text-3xl font-black text-blue-600">12+</div>
              <div className="text-sm text-slate-500 mt-0.5">Years of Excellence</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Building Trust Through Quality</h3>
            <p className="text-slate-500 mb-5 leading-relaxed">
              {siteConfig.name} was founded with a simple yet powerful idea: customers deserve access to the best
              products with complete transparency and confidence. We carefully curate every item to meet the
              highest standards of quality, durability and value.
            </p>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Our expert team evaluates, tests and selects products that genuinely make a difference in your
              personal and professional life. We don&apos;t compromise — and neither should you.
            </p>
            <ul className="space-y-3">
              {highlights.map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-6">
          {pillars.map(p => (
            <div key={p.title} className="relative bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${p.accent} rounded-l-2xl`} />
              <h4 className="text-lg font-bold text-slate-900 mb-3">{p.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
