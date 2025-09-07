"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/" className="text-gray-600 hover:text-black transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
            ← Back to Surbee
          </Link>
        </div>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
          Last Updated: 8/27/2025
        </p>

        {/* Title */}
        <h1 className="text-6xl mb-16 tracking-tight text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 100 }}>
          Terms of Use
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
          
          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>1. Acceptance of Terms</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              By accessing and using Surbee ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>2. Description of Service</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Surbee is an AI-powered survey creation and distribution platform that helps users create professional surveys, 
              collect responses, and analyze data with advanced accuracy checking systems.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>3. User Accounts and Registration</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              To access certain features of the Service, you may be required to create an account. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>4. Acceptable Use</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not use the Service:
            </p>
            <ul className="mb-4 text-gray-700 leading-relaxed ml-6">
              <li className="mb-2">• To violate any applicable laws or regulations</li>
              <li className="mb-2">• To create surveys that are harmful, offensive, or discriminatory</li>
              <li className="mb-2">• To collect personal information without proper consent</li>
              <li className="mb-2">• To interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>5. Privacy and Data Protection</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
              to understand our practices.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>6. Intellectual Property</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              The Service and its original content, features, and functionality are and will remain the exclusive property of 
              Surbee and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>7. Limitation of Liability</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              In no event shall Surbee, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of 
              profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>8. Referral Program ("Invite and Earn")</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Surbee offers a referral program that allows users to earn credits by inviting friends to join the platform.
            </p>
            <ul className="mb-4 text-gray-700 leading-relaxed ml-6">
              <li className="mb-2">• Eligible users receive 5 credits for each successful referral</li>
              <li className="mb-2">• A "successful referral" occurs when an invited user signs up using your referral link and completes their first project</li>
              <li className="mb-2">• Credits are awarded within 24 hours of referral completion</li>
              <li className="mb-2">• Referral credits cannot be exchanged for cash and have no monetary value</li>
              <li className="mb-2">• Surbee reserves the right to investigate suspicious referral activity and may suspend or terminate accounts that engage in fraudulent behavior</li>
              <li className="mb-2">• Self-referrals, fake accounts, or any attempt to manipulate the system will result in forfeiture of all referral credits</li>
              <li className="mb-2">• Surbee may modify or discontinue the referral program at any time without prior notice</li>
              <li className="mb-2">• Referral links are unique to each user and must not be shared in spam or unsolicited communications</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>9. Changes to Terms</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
              material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>10. Contact Information</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Use, please contact us at legal@surbee.com.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}