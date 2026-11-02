import React from "react";
import { Shield, Zap, HeartHandshake, Star, Award, Clock } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Quality Guaranteed", description: "Every product is rigorously tested and meets our strict quality standards before listing.", bg: "bg-blue-50", text: "text-blue-600" },
  { icon: Zap, title: "Fast & Reliable", description: "Count on timely delivery and consistent product availability backed by our robust supply chain.", bg: "bg-amber-50", text: "text-amber-600" },
  { icon: HeartHandshake, title: "Customer First", description: "Our dedicated support team is available to help you find the right product for your needs.", bg: "bg-rose-50", text: "text-rose-600" },
  { icon: Star, title: "Premium Selection", description: "We curate only the best — hand-picked products from trusted manufacturers and industry leaders.", bg: "bg-purple-50", text: "text-purple-600" },
  { icon: Award, title: "Certified Excellence", description: "Our business holds multiple industry certifications, ensuring you receive nothing but the best.", bg: "bg-green-50", text: "text-green-600" },
  { icon: Clock, title: "Always Available", description: "Browse our catalogue 24/7 and access your account from any device, anywhere in the world.", bg: "bg-indigo-50", text: "text-indigo-600" },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 bg-white" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">Why Us</span>
          <h2 id="why-heading" className="mt-2 text-4xl font-bold text-slate-900 tracking-tight">Why Choose Us?</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">We go beyond simply listing products. Our commitment to excellence sets us apart from the competition.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map(r => (
            <div key={r.title} className="group p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-xl ${r.bg} mb-5 group-hover:scale-110 transition-transform`}>
                <r.icon className={`w-6 h-6 ${r.text}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{r.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
