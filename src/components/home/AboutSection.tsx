import React from "react";
import Image from "next/image";
import { Target, Eye, Heart, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const pillars = [
  { icon: Target, title: "Our Mission", description: "To deliver premium products with unmatched quality and reliability, empowering our customers to achieve their goals with confidence.", bg: "bg-blue-50", text: "text-blue-600" },
  { icon: Eye, title: "Our Vision", description: "To become the most trusted product catalogue platform for professionals and businesses across the globe.", bg: "bg-indigo-50", text: "text-indigo-600" },
  { icon: Heart, title: "Our Values", description: "Integrity, innovation and customer-first thinking guide every product selection and business decision we make.", bg: "bg-purple-50", text: "text-purple-600" },
];

const highlights = ["ISO-certified quality standards", "Dedicated customer support team", "Trusted by 10,000+ businesses", "Eco-conscious product sourcing"];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">Who We Are</span>
          <h2 id="about-heading" className="mt-2 text-4xl font-bold text-slate-900 tracking-tight">About {siteConfig.name}</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">We are a company built on the belief that quality products and outstanding service go hand in hand.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="Our modern office" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-5 border border-slate-200">
              <div className="text-3xl font-bold text-blue-600">12+</div>
              <div className="text-sm text-slate-500">Years of Excellence</div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Building Trust Through Quality</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">{siteConfig.name} was founded with a simple yet powerful idea: customers deserve access to the best products with complete transparency and confidence.</p>
            <p className="text-slate-500 mb-8 leading-relaxed">Our expert team works tirelessly to evaluate, test and select products that genuinely make a difference in your personal and professional life.</p>
            <ul className="space-y-3">
              {highlights.map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {pillars.map(p => (
            <div key={p.title} className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-xl ${p.bg} mb-5`}><p.icon className={`w-6 h-6 ${p.text}`} /></div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">{p.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
