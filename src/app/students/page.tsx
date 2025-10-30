"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Mail, Users, Coffee, Heart, BookOpen, Star, Award, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleClaimOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement student verification logic
    console.log('Student email:', email);
    
    // For now, just show success message
    setTimeout(() => {
      setLoading(false);
      alert('Check your email for verification instructions!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-8 py-2 h-[88px] flex items-center">
          <div className="flex justify-between items-center w-full">
            {/* Logo */}
            <div className="flex items-center">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-16" />
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                About
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Pricing
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-black px-4 py-2 rounded-md transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                    Try Surbee Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              Special Student Offer
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl mb-8 tracking-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 100 }}>
            Surbee for Students
          </h1>
          
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            Empowering the next generation of researchers, innovators, and changemakers. 
            Get 3 months of Surbee Pro completely free with your student email.
          </p>

          {/* Hero Image Placeholder */}
          <div className="mb-12 flex justify-center">
            <div className="bg-gray-100 rounded-2xl p-8 w-full max-w-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                  Image Placeholder
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => document.getElementById('claim-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center" 
            style={{ fontFamily: 'FK Grotesk, sans-serif' }}
          >
            Verify Status
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-8 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              Why We Support Students
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              We believe students are the driving force behind innovation and positive change. You're not just learning — 
              you're pushing boundaries, challenging assumptions, and creating solutions for tomorrow's problems. 
              That's exactly what Surbee is built for.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl mb-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Coffee className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                Innovation First
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Students bring fresh perspectives and aren't afraid to challenge the status quo
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-xl mb-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                Purpose-Driven Research
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Academic research has the power to create real impact and solve meaningful problems
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-xl mb-4 w-16 h-16 mx-auto flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                Learning Excellence
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Quality tools and resources should be accessible to all students, regardless of budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Pro Includes */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-8 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              What's Included in Surbee Pro
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              Everything you need for professional-grade research and survey creation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Unlimited Projects",
                description: "Organize all your research projects and surveys without limits",
                icon: Globe
              },
              {
                title: "Advanced AI Assistant",
                description: "PhD-grade question generation and survey optimization",
                icon: Zap
              },
              {
                title: "Deep Research Tools",
                description: "Advanced analytics and insights for comprehensive analysis",
                icon: Shield
              },
              {
                title: "Extended Thinking",
                description: "AI that can handle complex, multi-step research problems",
                icon: Award
              },
              {
                title: "Priority Support", 
                description: "Get help when you need it most, especially during crunch time",
                icon: Heart
              },
              {
                title: "Professional Exports",
                description: "Export data in formats perfect for academic papers and presentations",
                icon: BookOpen
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <feature.icon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <h3 className="font-medium text-black" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-8 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              How It Works
            </h2>
            <p className="text-xl text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              Get started in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up with .edu Email",
                description: "Use your university email address to create your Surbee account",
                icon: Mail
              },
              {
                step: "2", 
                title: "Verify Student Status",
                description: "We'll send a quick verification link to confirm your student status",
                icon: Users
              },
              {
                step: "3",
                title: "Get Pro Instantly",
                description: "Start using all Pro features immediately — no credit card required",
                icon: Star
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                {/* Step Image Placeholder */}
                <div className="bg-white rounded-2xl p-8 mb-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                      Step {item.step}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
                  {item.title}
                </h3>
                <p className="text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-8 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
              Students Love Surbee
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Surbee transformed my thesis research. The AI helped me create unbiased questions and the quality verification gave me confidence in my data.",
                name: "Sarah Chen",
                school: "Stanford University",
                major: "Psychology PhD"
              },
              {
                quote: "As a sociology major, getting quality survey responses was always a challenge. Surbee's Credit Network solved that completely.",
                name: "Marcus Johnson",
                school: "Harvard University", 
                major: "Sociology"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8">
                <p className="text-gray-700 mb-6 italic text-lg" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-gray-600 font-medium" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-black" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                      {testimonial.name}
                    </p>
                    <p className="text-gray-600 text-sm" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                      {testimonial.major} • {testimonial.school}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Section */}
      <section id="claim-section" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl mb-8 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>
            Get Started Today
          </h2>
          <p className="text-xl text-gray-700 mb-12" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            Join thousands of students already using Surbee Pro for better research outcomes
          </p>

          <form onSubmit={handleClaimOffer} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your .edu email"
                required
                pattern=".*\.edu$"
                className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500"
                style={{ fontFamily: 'FK Grotesk, sans-serif' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                style={{ fontFamily: 'FK Grotesk, sans-serif' }}
              >
                {loading ? 'Verifying...' : 'Verify Status'}
              </button>
            </div>
            <p className="text-gray-600 text-sm mt-3" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              Must be a valid .edu email address
            </p>
          </form>

          <div className="mt-12 p-6 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-700" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              <strong>Why we offer this:</strong> We believe in democratizing access to powerful research tools. 
              Students shouldn't have to choose between quality and affordability when conducting important research 
              that could change the world.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Footer Links */}
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Product</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Lyra</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Cipher</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Credit Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Resources</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Education</a></li>
                <li><Link href="/students" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Students</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Researchers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Legal</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GDPR</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Follow Us</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">X / Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">LinkedIn</a></li>
                <li><a href="https://discord.gg/krs577Qxqr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Reddit</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-20" />
            </div>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              © 2025 Surbee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}