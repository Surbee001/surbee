'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function TermsPage() {
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Initial html class manipulation
    !function(o: any,c: any){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

    // Force background color
    document.body.style.backgroundColor = '#EEE9E5';

    // Ensure body is scrollable immediately
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }, []);

  return (
    <div style={{ backgroundColor: '#EEE9E5', minHeight: '100vh', color: '#000', fontFamily: 'sans-serif' }} className="landnew-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        /* Reset Tailwind Preflight conflicts for this page scope */
        .landnew-page-wrapper img, .landnew-page-wrapper svg {
          display: inline-block;
          vertical-align: middle;
        }
        .landnew-page-wrapper a {
          color: inherit;
          text-decoration: none;
        }
        /* Ensure footer links are white in dark background */
        .footer--link.is--white-opacity {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .footer--link.is--white-opacity:hover {
          color: #fff !important;
        }
        .black--bg {
          background-color: #000;
          color: #fff;
        }
        .black--bg h1, .black--bg h2, .black--bg h3, .black--bg p, .black--bg div {
          color: inherit;
        }

        /* Kalice Regular Font */
        @font-face {
          font-family: 'Kalice Regular';
          src: url('/fonts/Kalice-Trial-Regular.otf') format('opentype');
        }

        /* Apply Kalice font to all serif titles */
        .landnew-page-wrapper h1 {
          font-family: 'Kalice Regular', serif;
        }

        /* Terms Page Specific Styles */
        .terms-hero {
            text-align: center;
        }
        .terms-hero .container--872,
        .terms-hero .container--532 {
            margin-left: auto;
            margin-right: auto;
        }
        .terms-hero h1 {
            padding-bottom: 32rem;
            overflow: visible;
            line-height: 1.1;
        }
        .terms-hero .container--872 {
            overflow: visible;
            padding-bottom: 20rem;
        }
        .terms-hero .is--16margin-bottom {
            margin-bottom: 32rem !important;
        }
        .effective-date {
            font-family: 'Suisse intl mono', monospace;
            font-size: 14rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .terms-content h2 {
            font-family: 'Kalice Regular', serif;
            font-size: 28rem;
            line-height: 1.2;
            margin-top: 48rem;
            margin-bottom: 20rem;
            color: #1a1a1a;
        }
        .terms-content h3 {
            font-family: 'Suisse intl mono', monospace;
            font-size: 14rem;
            margin-top: 32rem;
            margin-bottom: 12rem;
            font-weight: 600;
            line-height: 1.3;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .terms-content p, .terms-content li {
            font-family: 'Suisse intl', sans-serif;
            font-size: 16rem;
            line-height: 1.6;
            margin-bottom: 16rem;
            color: #333;
        }
        .terms-content ul {
            list-style-type: disc;
            padding-left: 24rem;
            margin-bottom: 20rem;
        }
        .terms-content strong {
            color: #1a1a1a;
            font-weight: 600;
        }
        .terms-highlight {
            background-color: rgba(255, 107, 53, 0.08);
            padding: 24rem;
            border-radius: 16rem;
            margin-bottom: 24rem;
            border: 1rem solid rgba(255, 107, 53, 0.2);
        }
        .terms-highlight p {
            margin-bottom: 0;
        }

        /* CTA Section Overrides */
        .section.is--160padding.w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a {
            background-color: #EEE9E5 !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .section.is--160padding .container--778 {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .section.is--160padding .h1.is--h2-tablet {
            font-family: 'Kalice Regular', serif !important;
            color: #1a1a1a !important;
        }
        .section.is--160padding .label.is--50 {
            color: #666 !important;
        }
        .section.is--160padding .div-block-7 {
            justify-content: center;
            display: flex;
        }
      `}} />

      <title>Terms of Service - Surbee</title>

      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/css/deepjudge-staging.webflow.shared.5147e2e55.min.css" rel="stylesheet" type="text/css"/>
      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a5ca6760aeae5cf6e74_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png" rel="shortcut icon" type="image/x-icon"/>
      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a3fcb9742b4b6c2426b_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png" rel="apple-touch-icon"/>
      <link href="/landnew/deepjudge-code.netlify.app/style.css" rel="stylesheet" />

      <div className="tag-gtn w-embed w-iframe">
        <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PDQBBX4F"
                height="0" width="0" style={{display:'none', visibility:'hidden'}}></iframe>
        </noscript>
      </div>

      <div className="embed--typography w-embed">
        <style dangerouslySetInnerHTML={{__html: `
          html { font-size: calc(100vw/1440); }
          body { overflow-x:hidden; overflow: overlay; -webkit-font-smoothing: antialiased; }
          @media screen and (min-width: 1440px) { html {font-size: 1px;} }
          @media screen and (min-width: 768px) and (max-width: 991px) { html {font-size: calc(100vw/768);} }
          @media screen and (min-width: 480px) and (max-width: 767px) { html {font-size: calc(100vw/480);} }
          @media screen and (max-width: 479px) { html {font-size: calc(100vw/375);} }
        `}} />
      </div>

      <div className="bookademobg"></div>

      <nav animation="loading-reverse" className="navbar is--activ">
        <div className="container--navbar">
          <a href="/" aria-current="page" className="brand--link w-inline-block w--current">
            <img src="/logo.svg" alt="Surbee" className="brand--img" style={{height: '20px', width: 'auto', filter: 'brightness(0) invert(1)'}}/>
          </a>
          <div className="navbar--menu">
            <div className="navbar--menu-inside">
              <div data-wf--slot-item-navbar-link--variant="base" className="navbar--link-parent">
                <a href="/product" className="navbar--link">Product</a>
              </div>
              <div data-wf--slot-item-navbar-link--variant="base" className="navbar--link-parent">
                <a href="/enterprise" className="navbar--link">Enterprise</a>
              </div>
              <div data-wf--slot-item-navbar-link--variant="base" className="navbar--link-parent">
                <a href="/pricing" className="navbar--link">Pricing</a>
              </div>
              <div className="navbar--link-parent is--dropdown">
                <div className="navbar--dropdown">
                  <div className="navbar--dropdown-trigger">
                    <div>Company</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 14" fill="none" className="navbar--arrow">
                      <mask id="mask0_2781_1663" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="14">
                        <rect width="12" height="14" fill="#D9D9D9"></rect>
                      </mask>
                      <g mask="url(#mask0_2781_1663)">
                        <path d="M6 10L2 5.8363L2.82051 5L6 8.30961L9.17949 5L10 5.8363L6 10Z" fill="currentColor"></path>
                      </g>
                    </svg>
                  </div>
                  <div className="navbar--dropdown-response">
                    <div className="navbar--dropdown-response-inner">
                      <a href="/about-us" className="navbar--dropdown-link">About</a>
                      <a href="/careers" className="navbar--dropdown-link">Careers</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="navbar--link-parent is--dropdown">
                <div className="navbar--dropdown">
                  <div className="navbar--dropdown-trigger">
                    <div>Resources</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 14" fill="none" className="navbar--arrow">
                      <mask id="mask0_2781_1663_2" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="14">
                        <rect width="12" height="14" fill="#D9D9D9"></rect>
                      </mask>
                      <g mask="url(#mask0_2781_1663_2)">
                        <path d="M6 10L2 5.8363L2.82051 5L6 8.30961L9.17949 5L10 5.8363L6 10Z" fill="currentColor"></path>
                      </g>
                    </svg>
                  </div>
                  <div className="navbar--dropdown-response">
                    <div className="navbar--dropdown-response-inner">
                      <a href="/blog" className="navbar--dropdown-link" style={{ display: 'none' }}>Blog</a>
                      <a href="/news" className="navbar--dropdown-link">News</a>
                      <a href="/learn" className="navbar--dropdown-link">Learn</a>
                      <a href="/students" className="navbar--dropdown-link">Students</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="w-node-_9c17e2da-1455-530c-46e9-c4b3514ab2a8-514ab289" className="btn--nav-wrapper">
              <Link href="/login" className="w-inline-block">
                <div animation="bookademo" className="btn--nav is--full">
                  <div className="hover--bg is--purple"></div>
                  <div className="relative">Get Started</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 21 21" fill="none" className="icon--20 is--nav">
                    <path d="M0.564451 0.635007C1.00098 0.170908 1.85566 -0.0818191 2.48518 0.0238669C4.314 0.32714 4.02911 2.71656 6.38637 2.98307C7.72352 3.13471 8.40359 2.19732 9.75453 2.74873C10.5816 3.08876 11.0687 3.9756 11.0182 4.85325C10.9952 5.22086 10.816 5.65279 10.8206 6.03418C10.8436 8.13411 13.0676 9.61372 14.878 8.21682C16.3576 7.07725 15.6729 5.37709 16.9596 4.52241C18.9308 3.21742 21.2789 5.6482 19.9417 7.49081C18.8205 9.03474 16.9504 7.80786 15.5397 9.23233C14.6896 10.0916 14.9194 10.9141 14.4966 11.7918C14.1841 12.4351 13.4857 12.8992 12.7643 12.9543C11.3904 13.06 10.9676 11.9296 9.80967 11.5712C7.11238 10.7395 5.38465 13.7079 7.22726 15.8216C7.75109 16.419 8.49549 16.6166 8.61037 17.5677C8.97337 20.6878 4.97109 20.9543 4.43807 18.4775C4.07506 16.7912 5.92227 16.2535 5.16409 14.0295C4.78729 12.9221 3.78098 12.6924 3.45014 11.8929C3.19741 11.2817 3.19281 10.3535 3.56042 9.78373C4.09344 8.95203 4.75053 9.02095 5.50871 8.59821C7.13076 7.69299 7.63162 5.58846 6.0785 4.35699C5.37086 3.79639 4.62187 3.71368 3.73503 3.82856C2.84819 3.94344 2.47599 4.50403 1.37318 4.11805C-0.0604741 3.64016 -0.441862 1.70565 0.564451 0.635007ZM8.69767 6.98076C5.95443 7.38972 7.17671 11.7136 9.77751 10.4638C11.6063 9.58615 10.6827 6.68208 8.69767 6.98076Z" fill="white"></path>
                  </svg>
                </div>
              </Link>
            </div>
            <div className="navbar--menu-privacy">
              <a href="/privacy" className="footer--link is--white-opacity">Privacy Policy<br/></a>
              <a href="/terms" className="footer--link is--white-opacity">Terms of Service<br/></a>
              <a href="#" className="footer--link is--white-opacity cky-banner-element">Cookie Settings<br/></a>
            </div>
          </div>
          <div id="w-node-_9c17e2da-1455-530c-46e9-c4b3514ab2b8-514ab289" className="menu--trigger">
            <div className="overflow--hidden is--nav">
              <div className="menu--trigger-text">
                <div>Menu</div>
                <div>Close</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-wrapper">
        <section className="section is--hero terms-hero" style={{ paddingBottom: '60rem' }}>
          <div className="container--872 is--16margin-bottom">
            <h1 animation="loading-split" className="heading--96">Terms of Service</h1>
          </div>
          <div className="container--532">
            <p animation="loading" className="paragraph--16 effective-date">Effective Date: January 25, 2025</p>
          </div>
        </section>

        <section className="section is--padding">
          <div className="terms-content" style={{ maxWidth: '800rem', margin: '0 auto', paddingLeft: '24rem', paddingRight: '24rem' }}>

            {/* Introduction */}
            <p animation="loading">Welcome to Surbee. These Terms of Service ("Terms") govern your access to and use of our AI-powered survey platform. By accessing or using Surbee, you agree to be bound by these Terms.</p>

            {/* Section 1 */}
            <h2 animation="loading">1. Acceptance of Terms</h2>
            <p animation="loading">By creating an account or using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service.</p>

            {/* Section 2 */}
            <h2 animation="loading">2. Description of Service</h2>
            <p animation="loading">Surbee is an AI-powered survey creation and distribution platform that enables users to:</p>
            <ul animation="loading">
              <li>Create professional surveys using natural language AI</li>
              <li>Collect and analyze survey responses</li>
              <li>Detect fraudulent responses using our Cipher™ technology</li>
              <li>Access analytics and insights about survey performance</li>
              <li>Manage projects and collaborate with team members</li>
            </ul>

            {/* Section 3 */}
            <h2 animation="loading">3. User Accounts and Registration</h2>

            <h3 animation="loading">3.1 Account Creation</h3>
            <p animation="loading">To access certain features of the Service, you must create an account by providing accurate and complete information, including your email address and password.</p>

            <h3 animation="loading">3.2 Account Security</h3>
            <p animation="loading">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized access or security breach.</p>

            <h3 animation="loading">3.3 Account Termination</h3>
            <p animation="loading">We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activity.</p>

            {/* Section 4 */}
            <h2 animation="loading">4. Acceptable Use Policy</h2>

            <p animation="loading">You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:</p>
            <ul animation="loading">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Create surveys that are harmful, offensive, discriminatory, or harassing</li>
              <li>Collect personal information without proper consent or disclosure</li>
              <li>Use the Service to distribute spam, malware, or phishing content</li>
              <li>Interfere with or disrupt the Service, servers, or networks</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
              <li>Use the Service to compete with Surbee or build a similar product</li>
            </ul>

            {/* Section 5 */}
            <h2 animation="loading">5. Subscription Plans and Payment</h2>

            <h3 animation="loading">5.1 Subscription Tiers</h3>
            <p animation="loading">Surbee offers various subscription plans with different features and pricing. You can view current plans and pricing on our website.</p>

            <h3 animation="loading">5.2 Billing</h3>
            <p animation="loading">Subscription fees are billed in advance on a recurring basis (monthly or annually, depending on your plan). You authorize us to charge your payment method for all fees owed.</p>

            <h3 animation="loading">5.3 Cancellation and Refunds</h3>
            <p animation="loading">You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. We do not provide refunds for partial subscription periods.</p>

            {/* Section 6 */}
            <h2 animation="loading">6. Intellectual Property Rights</h2>

            <h3 animation="loading">6.1 Our Property</h3>
            <p animation="loading">The Service and its original content, features, and functionality (including but not limited to software, design, text, graphics, and logos) are and will remain the exclusive property of Surbee and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws.</p>

            <h3 animation="loading">6.2 Your Content</h3>
            <p animation="loading">You retain ownership of all surveys, questions, and data you create or upload to the Service ("Your Content"). By using the Service, you grant us a limited, non-exclusive license to host, store, and process Your Content solely to provide the Service to you.</p>

            <h3 animation="loading">6.3 Feedback</h3>
            <p animation="loading">If you provide feedback, suggestions, or ideas about the Service, you grant us the right to use such feedback without any obligation to you.</p>

            {/* Section 7 */}
            <h2 animation="loading">7. Data Collection and Privacy</h2>

            <p animation="loading">Your privacy is important to us. Our collection, use, and sharing of your personal information is governed by our Privacy Policy. By using the Service, you consent to our data practices as described in the Privacy Policy.</p>

            <div className="terms-highlight" animation="loading">
              <p><strong>Important:</strong> As a survey creator, you are responsible for complying with all applicable data protection laws (including GDPR, CCPA, and other regulations) when collecting respondent data through our platform.</p>
            </div>

            {/* Section 8 */}
            <h2 animation="loading">8. Cipher™ Fraud Detection</h2>

            <p animation="loading">Our Cipher™ technology analyzes survey responses for signs of fraud or inauthenticity. While we strive for accuracy, the fraud detection system is not infallible. You acknowledge that:</p>
            <ul animation="loading">
              <li>Fraud scores are probabilistic and should be used as one factor in data quality assessment</li>
              <li>We do not guarantee that all fraudulent responses will be detected</li>
              <li>Legitimate responses may occasionally be flagged as suspicious</li>
              <li>You are ultimately responsible for validating and using your survey data appropriately</li>
            </ul>

            {/* Section 9 */}
            <h2 animation="loading">9. Disclaimers and Limitations of Liability</h2>

            <h3 animation="loading">9.1 Service Availability</h3>
            <p animation="loading">The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>

            <h3 animation="loading">9.2 Limitation of Liability</h3>
            <p animation="loading">To the maximum extent permitted by law, Surbee and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:</p>
            <ul animation="loading">
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Service interruptions or security breaches</li>
              <li>Errors or inaccuracies in survey data or fraud detection</li>
              <li>Third-party actions or content</li>
            </ul>

            <h3 animation="loading">9.3 Maximum Liability</h3>
            <p animation="loading">Our total liability to you for all claims arising out of or related to these Terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.</p>

            {/* Section 10 */}
            <h2 animation="loading">10. Indemnification</h2>

            <p animation="loading">You agree to indemnify, defend, and hold harmless Surbee and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of:</p>
            <ul animation="loading">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable laws or third-party rights</li>
              <li>Your Content or surveys created using the Service</li>
            </ul>

            {/* Section 11 */}
            <h2 animation="loading">11. Modifications to the Service</h2>

            <p animation="loading">We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.</p>

            {/* Section 12 */}
            <h2 animation="loading">12. Changes to These Terms</h2>

            <p animation="loading">We may update these Terms from time to time. We will notify you of any material changes by:</p>
            <ul animation="loading">
              <li>Sending an email to the address associated with your account</li>
              <li>Posting a prominent notice on our website or within the Service</li>
              <li>Updating the "Effective Date" at the top of these Terms</li>
            </ul>
            <p animation="loading">Your continued use of the Service after any changes indicates your acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service.</p>

            {/* Section 13 */}
            <h2 animation="loading">13. Governing Law and Dispute Resolution</h2>

            <h3 animation="loading">13.1 Governing Law</h3>
            <p animation="loading">These Terms shall be governed by and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions.</p>

            <h3 animation="loading">13.2 Arbitration</h3>
            <p animation="loading">Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with Swiss arbitration rules, except that you may bring an individual claim in small claims court if it qualifies.</p>

            <h3 animation="loading">13.3 Class Action Waiver</h3>
            <p animation="loading">You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>

            {/* Section 14 */}
            <h2 animation="loading">14. Miscellaneous</h2>

            <h3 animation="loading">14.1 Entire Agreement</h3>
            <p animation="loading">These Terms, together with our Privacy Policy, constitute the entire agreement between you and Surbee regarding the Service.</p>

            <h3 animation="loading">14.2 Severability</h3>
            <p animation="loading">If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>

            <h3 animation="loading">14.3 Waiver</h3>
            <p animation="loading">Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>

            <h3 animation="loading">14.4 Assignment</h3>
            <p animation="loading">You may not assign or transfer these Terms or your rights and obligations under these Terms without our prior written consent. We may assign these Terms without restriction.</p>

            {/* Section 15 */}
            <h2 animation="loading">15. Contact Information</h2>

            <p animation="loading">If you have any questions about these Terms of Service, please contact us:</p>
            <p animation="loading" style={{ marginTop: '24rem' }}>
              <strong>Email:</strong> <a href="mailto:legal@surbee.com" style={{ textDecoration: 'underline' }}>legal@surbee.com</a><br/>
              <strong>Address:</strong> Surbee AG<br/>
              Switzerland
            </p>

          </div>
        </section>

        <section data-wf--global---cta--color="black-version" className="section is--160padding w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a">
          <div className="container--778 is--knowledge-search">
            <div animation="fade">
              <div className="label is--50">get started</div>
            </div>
            <h2 animation="fade-split" className="h1 is--h2-tablet">Beyond surveys, intelligence.</h2>
            <div animation="fade" className="div-block-7">
              <div>
                <a href="/product" className="btn--book w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--white w-inline-block">
                  <div className="hover--bg w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--black"></div>
                  <div className="relative">explore the product</div>
                </a>
              </div>
              <div className="div-block-6">
                <a animation="bookademo" href="#" className="btn--book w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--purple w-inline-block">
                  <div className="hover--bg w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--purple"></div>
                  <div className="relative" style={{ color: '#000' }}>book a demo</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 21 21" fill="none" className="icon--20 w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a">
                    <path d="M0.564451 0.635007C1.00098 0.170908 1.85566 -0.0818191 2.48518 0.0238669C4.314 0.32714 4.02911 2.71656 6.38637 2.98307C7.72352 3.13471 8.40359 2.19732 9.75453 2.74873C10.5816 3.08876 11.0687 3.9756 11.0182 4.85325C10.9952 5.22086 10.816 5.65279 10.8206 6.03418C10.8436 8.13411 13.0676 9.61372 14.878 8.21682C16.3576 7.07725 15.6729 5.37709 16.9596 4.52241C18.9308 3.21742 21.2789 5.6482 19.9417 7.49081C18.8205 9.03474 16.9504 7.80786 15.5397 9.23233C14.6896 10.0916 14.9194 10.9141 14.4966 11.7918C14.1841 12.4351 13.4857 12.8992 12.7643 12.9543C11.3904 13.06 10.9676 11.9296 9.80967 11.5712C7.11238 10.7395 5.38465 13.7079 7.22726 15.8216C7.75109 16.419 8.49549 16.6166 8.61037 17.5677C8.97337 20.6878 4.97109 20.9543 4.43807 18.4775C4.07506 16.7912 5.92227 16.2535 5.16409 14.0295C4.78729 12.9221 3.78098 12.6924 3.45014 11.8929C3.19741 11.2817 3.19281 10.3535 3.56042 9.78373C4.09344 8.95203 4.75053 9.02095 5.50871 8.59821C7.13076 7.69299 7.63162 5.58846 6.0785 4.35699C5.37086 3.79639 4.62187 3.71368 3.73503 3.82856C2.84819 3.94344 2.47599 4.50403 1.37318 4.11805C-0.0604741 3.64016 -0.441862 1.70565 0.564451 0.635007ZM8.69767 6.98076C5.95443 7.38972 7.17671 11.7136 9.77751 10.4638C11.6063 9.58615 10.6827 6.68208 8.69767 6.98076Z" fill="currentColor"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>


      <footer data-wf--global---footer--variant="base" className="section is--footer">
        <div className="footer-content">
          <div className="footer--row" style={{ paddingLeft: '0' }}>
            <div style={{ marginRight: '40px' }}>
              <a href="/" aria-current="page" className="footer--logo-link w-inline-block w--current">
                <img src="/logo.svg" alt="Surbee" className="looter--logo-img" style={{ height: '50px', width: 'auto' }} />
              </a>
            </div>
            <div className="footer-columns">
              <div className="footer--column">
                <div className="label is--footer">explore</div>
                <div className="footer-column-inner">
                  <a href="/product" className="footer--link w-inline-block"><div>Product</div><div className="footerlink-line"></div></a>
                  <a href="/customers" className="footer--link w-inline-block"><div>Customers</div><div className="footerlink-line"></div></a>
                  <a href="/security" className="footer--link w-inline-block"><div>Security</div><div className="footerlink-line"></div></a>
                  <a href="/about-us" className="footer--link w-inline-block"><div>About</div><div className="footerlink-line"></div></a>
                </div>
              </div>
              <div className="footer--column">
                <div className="label is--footer">LEARN</div>
                <div className="footer-column-inner">
                  <a href="/blog" className="footer--link w-inline-block" style={{ display: 'none' }}><div>Blog</div><div className="footerlink-line"></div></a>
                  <a href="/news" className="footer--link w-inline-block"><div>News</div><div className="footerlink-line"></div></a>
                  <a href="/learn" className="footer--link w-inline-block"><div>Learn</div><div className="footerlink-line"></div></a>
                </div>
              </div>
              <div className="footer--column">
                <div className="label is--footer">CONNECT</div>
                <div className="footer-column-inner">
                  <a href="/subscribe" className="footer--link is--newlink w-inline-block">
                    <div className="div-block-28"><div>Subscribe</div><div className="footerlink-line"></div></div>
                    <div className="footer--new-mention">NEW</div>
                  </a>
                  <a href="/careers" className="footer--link w-inline-block"><div>Careers</div><div className="footerlink-line"></div></a>
                  <a href="/media-kit" className="footer--link w-inline-block"><div>Media Kit</div><div className="footerlink-line"></div></a>
                  <a href="https://www.linkedin.com/company/surbee/" target="_blank" className="footer--link w-inline-block"><div>LinkedIn</div><div className="footerlink-line"></div></a>
                  <a href="https://bsky.app/profile/surbee.bsky.social" target="_blank" className="footer--link w-inline-block"><div>BlueSky</div><div className="footerlink-line"></div></a>
                  <a href="https://x.com/surbeeai" target="_blank" className="footer--link w-inline-block"><div>X</div><div className="footerlink-line"></div></a>
                </div>
              </div>
            </div>
            <p className="body-small is--50opacity">© 2025 Surbee AG. All rights reserved.</p>
            <div className="footer--links">
              <a href="/terms" className="footer--link is--50opacity">Terms of Service<br/></a>
              <a href="/privacy" className="footer--link is--50opacity">Privacy Policy<br/></a>
              <a href="#" className="footer--link is--50opacity cky-banner-element">Cookie Settings<br/></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scripts */}
      <Script src="/landnew/d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=67bdd03200678df04ba07593" strategy="beforeInteractive" />
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.schunk.57d5559d2f0cd9f8.js" strategy="lazyOnload" />
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.schunk.b324484631ca48aa.js" strategy="lazyOnload" />
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.ae197c71.7d3d5a39186a7021.js" strategy="lazyOnload" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/split-type@0.3.4" strategy="lazyOnload" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/gsap.min.js" strategy="lazyOnload" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/ScrollTrigger.min.js" strategy="lazyOnload" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/CustomEase.min.js" strategy="lazyOnload" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/gsap@3.12.7/dist/MotionPathPlugin.min.js" strategy="lazyOnload" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" strategy="lazyOnload" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js" strategy="lazyOnload" />

      <Script src='/landnew/deepjudge-code.netlify.app/script.js' strategy="lazyOnload" />
      <Script src='/landnew/deepjudge-code.netlify.app/home.js' strategy="lazyOnload" />
    </div>
  );
}
