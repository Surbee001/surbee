"use client";

import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
          
          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>1. Information We Collect</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, 
              or contact us for support. This may include your name, email address, and survey responses.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>2. How We Use Your Information</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="mb-4 text-gray-700 leading-relaxed ml-6">
              <li className="mb-2">• Provide, maintain, and improve our services</li>
              <li className="mb-2">• Process transactions and send related information</li>
              <li className="mb-2">• Send technical notices, updates, and support messages</li>
              <li className="mb-2">• Respond to your comments and questions</li>
              <li className="mb-2">• Monitor and analyze trends and usage patterns</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>3. Information Sharing and Disclosure</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy. We may share your information in the following circumstances:
            </p>
            <ul className="mb-4 text-gray-700 leading-relaxed ml-6">
              <li className="mb-2">• With your explicit consent</li>
              <li className="mb-2">• To comply with legal obligations</li>
              <li className="mb-2">• To protect our rights and safety</li>
              <li className="mb-2">• In connection with a business transaction</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>4. Data Security</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>5. Data Retention</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
              unless a longer retention period is required by law.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>6. Your Rights and Choices</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              You have certain rights regarding your personal information, including:
            </p>
            <ul className="mb-4 text-gray-700 leading-relaxed ml-6">
              <li className="mb-2">• The right to access your personal information</li>
              <li className="mb-2">• The right to update or correct your information</li>
              <li className="mb-2">• The right to delete your information</li>
              <li className="mb-2">• The right to restrict processing</li>
              <li className="mb-2">• The right to data portability</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>7. Cookies and Tracking Technologies</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to collect and track information about your use of our service. 
              You can control the use of cookies through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>8. International Data Transfers</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>9. Changes to This Policy</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl mb-4 text-black" style={{ fontFamily: 'PP Editorial, serif', fontWeight: 200 }}>10. Contact Us</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@surbee.com.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}