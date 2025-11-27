'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function PrivacyPage() {
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

        /* Privacy Page Specific Styles */
        .privacy-hero {
            text-align: center;
        }
        .privacy-hero .container--872,
        .privacy-hero .container--532 {
            margin-left: auto;
            margin-right: auto;
        }
        .privacy-hero h1 {
            padding-bottom: 32rem;
            overflow: visible;
            line-height: 1.1;
        }
        .privacy-hero .container--872 {
            overflow: visible;
            padding-bottom: 20rem;
        }
        .privacy-hero .is--16margin-bottom {
            margin-bottom: 32rem !important;
        }
        .effective-date {
            font-family: 'Suisse intl mono', monospace;
            font-size: 14rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .privacy-content h2 {
            font-family: 'Kalice Regular', serif;
            font-size: 28rem;
            line-height: 1.2;
            margin-top: 48rem;
            margin-bottom: 20rem;
            color: #1a1a1a;
        }
        .privacy-content h3 {
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
        .privacy-content p, .privacy-content li {
            font-family: 'Suisse intl', sans-serif;
            font-size: 16rem;
            line-height: 1.6;
            margin-bottom: 16rem;
            color: #333;
        }
        .privacy-content ul {
            list-style-type: disc;
            padding-left: 24rem;
            margin-bottom: 20rem;
        }
        .privacy-content strong {
            color: #1a1a1a;
            font-weight: 600;
        }
        .privacy-highlight {
            background-color: rgba(255, 107, 53, 0.08);
            padding: 24rem;
            border-radius: 16rem;
            margin-bottom: 24rem;
            border: 1rem solid rgba(255, 107, 53, 0.2);
        }
        .privacy-highlight p {
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

      <title>Privacy Policy - Surbee</title>

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
        <section className="section is--hero privacy-hero" style={{ paddingBottom: '60rem' }}>
          <div className="container--872 is--16margin-bottom">
            <h1 animation="loading-split" className="heading--96">Privacy Policy</h1>
          </div>
          <div className="container--532">
            <p animation="loading" className="paragraph--16 effective-date">Effective Date: January 25, 2025</p>
          </div>
        </section>

        <section className="section is--padding">
          <div className="privacy-content" style={{ maxWidth: '800rem', margin: '0 auto', paddingLeft: '24rem', paddingRight: '24rem' }}>

            {/* Introduction */}
            <p animation="loading">This Privacy Policy describes how Surbee ("we," "us," or "our") collects, uses, and shares information when you use our AI-powered survey platform. By using our service, you agree to the collection and use of information in accordance with this policy.</p>

            {/* Section 1 */}
            <h2 animation="loading">1. Information We Collect</h2>

            <h3 animation="loading">1.1 Account Information</h3>
            <p animation="loading">When you create an account, we collect your email address, full name, and account credentials. We also store your user ID, profile information, and subscription status (including whether you have a Pro account).</p>

            <h3 animation="loading">1.2 Project and Survey Data</h3>
            <p animation="loading">We store all surveys and forms you create, including project titles, descriptions, survey schemas, question text, question types, answer options, and survey configurations. We also save preview screenshots of your surveys, published URLs, and the complete code bundles that power your surveys.</p>

            <h3 animation="loading">1.3 Survey Response Data</h3>
            <p animation="loading">When respondents complete your surveys, we collect their responses, submission timestamps, respondent IDs, session IDs, and IP addresses. For fraud detection purposes via our Cipher™ system, we also collect behavioral data including mouse movement patterns, keystroke timing data, timing data (how long respondents spend on each question), and device information (browser type, operating system, screen resolution).</p>

            <h3 animation="loading">1.4 Chat and AI Interaction Data</h3>
            <p animation="loading">We store all conversations you have with our AI assistant, including your prompts, the AI's responses, chat session metadata, and timestamps. This helps us improve your experience and maintain conversation context.</p>

            <h3 animation="loading">1.5 Analytics and Fraud Detection Data</h3>
            <p animation="loading">We calculate and store survey analytics including total response counts, completion rates, average completion times, fraud scores for each response, and flags for suspicious activity. Our Cipher™ fraud detection system analyzes behavioral patterns to identify potentially fraudulent survey responses.</p>

            <h3 animation="loading">1.6 Technical and Usage Information</h3>
            <p animation="loading">We automatically collect IP addresses, browser types, device identifiers, operating system information, referring URLs, pages viewed, time spent on pages, and cookie data.</p>

            {/* Section 2 */}
            <h2 animation="loading">2. Cipher™ Fraud Detection Technology</h2>

            <p animation="loading">At Surbee, we prioritize the integrity of your data. Our platform is powered by <strong>Cipher</strong>, our proprietary fraud detection and accuracy system that runs over 60 distinct authenticity checks across 7 detection layers.</p>

            <h3 animation="loading">2.1 What Cipher Monitors</h3>
            <ul animation="loading">
              <li><strong>Behavioral Biometrics:</strong> Mouse movements, touch interactions, and keystroke dynamics that distinguish human behavior from bots.</li>
              <li><strong>Device & Network Integrity:</strong> Consistency in device fingerprints, IP reputation, and detection of anonymizing proxies or VPNs associated with fraud.</li>
              <li><strong>AI & Automation Detection:</strong> Advanced detection of AI-generated text, automated scripts (like Selenium/Puppeteer), and copy-paste anomalies.</li>
              <li><strong>Cross-Session Consistency:</strong> Identification of "fraud rings" and coordinated patterns across multiple sessions.</li>
            </ul>

            <h3 animation="loading">2.2 How Cipher Data Is Used</h3>
            <p animation="loading">We use anonymized behavioral data and response patterns to train and refine our Cipher models. This continuous learning process helps us stay ahead of new fraud techniques and ensures the highest quality data for our customers.</p>

            <div className="privacy-highlight" animation="loading">
              <p><strong>Important:</strong> This data is strictly anonymized and aggregated. It is never used to identify individuals or for marketing purposes.</p>
            </div>

            {/* Section 3 */}
            <h2 animation="loading">3. How We Use Your Information</h2>

            <p animation="loading">We use the collected information to:</p>
            <ul animation="loading">
              <li>Provide and maintain our survey platform service</li>
              <li>Generate AI-powered surveys and forms based on your requirements</li>
              <li>Collect and analyze survey responses on your behalf</li>
              <li>Detect and prevent fraudulent survey responses through Cipher™</li>
              <li>Provide analytics and insights about survey performance</li>
              <li>Improve our AI models and service quality using anonymized, aggregated data</li>
              <li>Send you service updates, security alerts, and support messages</li>
              <li>Respond to your support requests and inquiries</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>

            {/* Section 4 */}
            <h2 animation="loading">4. AI Model Training</h2>

            <div className="privacy-highlight" animation="loading">
              <p><strong>What We Use:</strong> We may use anonymized and aggregated data from your interactions with our AI assistant to improve our models and services.</p>
            </div>

            <div className="privacy-highlight" animation="loading">
              <p><strong>What We Don't Use:</strong> We do not use your personal information, survey response data from your respondents, or any identifiable information to train AI models. Your account data, survey content, and respondent data remain private and are not used for model training purposes.</p>
            </div>

            {/* Section 5 */}
            <h2 animation="loading">5. How We Share Your Information</h2>

            <p animation="loading">We share your information only in the following circumstances:</p>
            <ul animation="loading">
              <li><strong>Service Providers:</strong> We work with third-party service providers for hosting (Supabase), authentication, payment processing, and email services. These providers have access to your information only to perform specific tasks on our behalf and are obligated to protect your data.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental request, or to protect our rights, property, or safety.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner.</li>
              <li><strong>With Your Consent:</strong> We may share your information for any other purpose with your explicit consent.</li>
            </ul>

            <div className="privacy-highlight" animation="loading">
              <p><strong>We do not sell your personal information to third parties for marketing purposes.</strong></p>
            </div>

            {/* Section 6 */}
            <h2 animation="loading">6. Data Security</h2>

            <p animation="loading">We implement industry-standard security measures to protect your information, including:</p>
            <ul animation="loading">
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Row-level security policies on database access</li>
              <li>Regular security audits and monitoring</li>
            </ul>
            <p animation="loading">However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>

            {/* Section 7 */}
            <h2 animation="loading">7. Data Retention</h2>

            <p animation="loading">We retain your information for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.</p>
            <p animation="loading">When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal purposes.</p>

            {/* Section 8 */}
            <h2 animation="loading">8. Your Rights and Choices</h2>

            <p animation="loading">Depending on your location, you may have the following rights:</p>
            <ul animation="loading">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to our processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>
            <p animation="loading">To exercise these rights, please contact us at <a href="mailto:privacy@surbee.com" style={{ textDecoration: 'underline' }}>privacy@surbee.com</a>. We will respond to your request within 30 days.</p>

            {/* Section 9 */}
            <h2 animation="loading">9. Cookies and Tracking Technologies</h2>

            <p animation="loading">We use cookies and similar tracking technologies to:</p>
            <ul animation="loading">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our service</li>
              <li>Analyze usage patterns and improve our service</li>
            </ul>
            <p animation="loading">You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our service.</p>

            {/* Section 10 */}
            <h2 animation="loading">10. Third-Party Services</h2>

            <p animation="loading">Our service integrates with third-party services including:</p>
            <ul animation="loading">
              <li>Supabase (database and authentication)</li>
              <li>Anthropic Claude (AI services)</li>
              <li>Payment processors (for subscription billing)</li>
            </ul>
            <p animation="loading">These third parties have their own privacy policies. We encourage you to review their policies to understand how they handle your information.</p>

            {/* Section 11 */}
            <h2 animation="loading">11. Children's Privacy</h2>

            <p animation="loading">Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately and we will delete such information.</p>

            {/* Section 12 */}
            <h2 animation="loading">12. International Data Transfers</h2>

            <p animation="loading">Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your jurisdiction. By using our service, you consent to the transfer of your information to the United States and other countries where we operate.</p>

            {/* Section 13 */}
            <h2 animation="loading">13. Changes to This Privacy Policy</h2>

            <p animation="loading">We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
            <ul animation="loading">
              <li>Sending an email to the address associated with your account</li>
              <li>Posting a prominent notice on our website</li>
            </ul>
            <p animation="loading">Your continued use of the service after any changes indicates your acceptance of the updated Privacy Policy.</p>

            {/* Section 14 */}
            <h2 animation="loading">14. Contact Us</h2>

            <p animation="loading">If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <p animation="loading" style={{ marginTop: '24rem' }}>
              <strong>Email:</strong> <a href="mailto:privacy@surbee.com" style={{ textDecoration: 'underline' }}>privacy@surbee.com</a><br/>
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
