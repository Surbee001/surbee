"use client";

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/" className="text-gray-600 hover:text-black transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            ← Back to Surbee
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-6xl mb-16 tracking-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 100 }}>
          About Surbee
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
          
          <section className="mb-16">
            <h2 className="text-3xl mb-6 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Our Mission</h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Surbee is revolutionizing how we collect, validate, and understand human insights. For too long, surveys have been 
              plagued by rushed responses, dishonest answers, and unreliable data that leads to poor decisions.
            </p>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              We believe that quality data drives better outcomes. That's why we've built the first AI-powered survey platform 
              that not only helps you create better questions but ensures every response you receive is thoughtful, genuine, 
              and actionable.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl mb-6 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>PhD-Grade Survey Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our AI understands survey methodology and helps you craft questions that eliminate bias, 
                  reduce ambiguity, and encourage thoughtful responses.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Response Quality Verification</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every response is analyzed for quality indicators including response time, pattern detection, 
                  and consistency checks to ensure data integrity.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Community-Powered Distribution</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our credit network connects researchers and participants in a fair ecosystem where 
                  quality contributions are rewarded and recognized.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-3 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Real-Time Analytics</h3>
                <p className="text-gray-700 leading-relaxed">
                  Advanced analytics help you understand not just what people say, but the quality and 
                  reliability of their responses in real-time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl mb-6 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Why It Matters</h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Bad data leads to bad decisions. Whether you're a researcher studying human behavior, a company trying to 
              understand your customers, or an organization seeking feedback from your community, the quality of your 
              insights depends entirely on the quality of your data.
            </p>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Traditional survey platforms focus on quantity over quality, leading to rushed responses, survey fatigue, 
              and unreliable results. Surbee flips this model by prioritizing thoughtful engagement and verified responses, 
              giving you confidence that your decisions are based on real, meaningful insights.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl mb-6 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Our Vision</h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              We envision a world where every important decision is backed by reliable human insights. Where researchers can 
              trust their data, where participants feel valued for their thoughtful contributions, and where the gap between 
              asking questions and understanding answers is bridged by intelligent technology.
            </p>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Surbee is more than a survey platform—it's a commitment to elevating the quality of human understanding 
              through better questions, better responses, and better insights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl mb-6 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>Join Our Mission</h2>
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">
              Whether you're a researcher, business leader, or someone who believes in the power of quality data, 
              we invite you to join us in revolutionizing how we collect and understand human insights.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="/signup" className="px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Get Started
              </Link>
              <Link href="https://discord.gg/krs577Qxqr" target="_blank" className="px-6 py-3 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Join Community
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}