import React from "react";
import { Shield, Zap, HeartHandshake, Star, Award, Clock } from "lucide-react";

const reasons = [
  { icon: Shield,        title: "Quality Guaranteed",  description: "Every product is rigorously tested and meets our strict quality standards before listing.", color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: Zap,           title: "Fast & Reliable",     description: "Count on consistent product availability backed by our robust supply chain network.",      color: "text-amber-600",  bg: "bg-amber-50"  },
  { icon: HeartHandshake,title: "Customer First",      description: "Our dedicated support team helps you find the perfect product for your unique needs.",      color: "text-rose-600",   bg: "bg-rose-50"   },
  { icon: Star,          title: "Premium Selection",   description: "Hand-picked products from trusted manufacturers and industry leaders across India.",          color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Award,         title: "Certified Excellence",description: "Multiple industry certifications ensure you receive only the best quality products.",        color: "text-green-600",  bg: "bg-green-50"  },
  { icon: Clock,         title: "Always Available",    description: "Browse our catalogue 24/7 and access your account from any device, anywhere.",               color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 bg-slate-50" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Why Us</span>
          <h2 id="why-heading" className="mt-3 text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Us?
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            We go beyond simply listing products. Our commitment to excellence sets us apart.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(r => (
            <div key={r.title} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`inline-flex p-3 rounded-xl ${r.bg} mb-5`}>
                <r.icon className={`w-6 h-6 ${r.color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{r.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
