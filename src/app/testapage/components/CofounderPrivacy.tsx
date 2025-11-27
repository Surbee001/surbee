"use client";
export default function CofounderPrivacy() {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-neutral-50 text-neutral-900">
      <div className="flex-1 w-full">
        <nav className="fixed top-0 z-[102] bg-white/90 backdrop-blur-sm transition-[min-height] duration-180 ease-in-out w-full">
          <div className="w-full">
            <div className="2xl:px-30 xl:px-12 md:px-8 px-5 max-w-[1920px] mx-auto w-full flex items-center justify-between py-2 min-h-20">
              <a className="text-neutral-900 hover:text-neutral-700 transition-colors" href="/testapage">
                <svg xmlns="http://www.w3.org/2000/svg" width={120} height={30} viewBox="0 0 86 16" fill="none"><path d="M81.6948 15.9999H78.3271V15.1618H79.1652V8.42147H78.3271V7.57828H79.1652V6.73509H80.0084V5.89191H80.8516V7.57828H81.6948V8.42147H80.8516V15.1618H81.6948V15.9999ZM85.0624 8.42147H83.3811V7.57828H81.6948V6.73509H85.0624V8.42147Z" fill="currentColor" /><path d="M75.7972 16H71.5864V15.162H70.7432V14.3188H69.9001V12.6324H69.062V10.108H69.9001V8.4216H70.7432V9.26479H75.7972V8.4216H74.954V7.57842H71.5864V6.73523H75.7972V7.57842H76.6404V8.4216H77.4836V10.108H70.7432V12.6324H71.5864V14.3188H72.4296V15.162H75.7972V16ZM71.5864 8.4216H70.7432V7.57842H71.5864V8.4216ZM77.4836 14.3188H76.6404V13.4756H77.4836V14.3188ZM76.6404 15.162H75.7972V14.3188H76.6404V15.162Z" fill="currentColor" /><path d="M68.6503 16H66.1207V15.162H65.2775V14.3188H66.1207V8.42159H65.2775V7.57841H66.1207V2.52442H65.2775V1.68123H66.1207V0.838046H66.9639V0H67.8071V15.162H68.6503V16ZM65.2775 16H61.9099V15.162H61.0667V14.3188H60.2235V12.6324H59.3855V10.108H60.2235V8.42159H61.0667V7.57841H61.9099V6.73522H65.2775V7.57841H62.7531V8.42159H61.9099V10.108H61.0667V12.6324H61.9099V14.3188H62.7531V15.162H65.2775V16Z" fill="currentColor" /><path d="M52.2128 15.9999H48.8452V15.1618H49.6833V8.42147H48.8452V7.57828H49.6833V6.73509H50.5264V5.89191H51.3696V7.57828H52.2128V8.42147H51.3696V15.1618H52.2128V15.9999ZM58.5316 15.9999H55.1588V15.1618H56.002V8.42147H55.1588V7.57828H52.2128V6.73509H56.002V7.57828H56.8452V8.42147H57.6884V15.1618H58.5316V15.9999Z" fill="currentColor" /><path d="M43.7859 16H40.8399V15.162H39.9967V14.3188H39.1535V7.57842H38.3154V6.73523H40.8399V14.3188H41.683V15.162H43.7859V16ZM48.0018 16H45.4722V14.3188H44.6291V13.4756H45.4722V7.57842H44.6291V6.73523H47.1586V15.162H48.0018V16ZM44.6291 15.162H43.7859V14.3188H44.6291V15.162Z" fill="currentColor" /><path d="M35.3639 16H31.1531V15.162H30.3099V14.3188H29.4667V12.6324H28.6287V10.108H29.4667V8.4216H30.3099V7.57842H31.1531V6.73523H35.3639V7.57842H36.2071V8.4216H37.0503V10.108H37.8934V12.6324H37.0503V14.3188H36.2071V15.162H35.3639V16ZM31.9963 15.162H34.5207V14.3188H35.3639V12.6324H36.2071V10.108H35.3639V8.4216H34.5207V7.57842H31.9963V8.4216H31.1531V10.108H30.3099V12.6324H31.1531V14.3188H31.9963V15.162Z" fill="currentColor" /><path d="M29.9083 2.52442H28.227V0.838046H25.6975V0H29.0651V0.838046H29.9083V2.52442ZM26.5407 16H23.173V15.162H24.0111V7.57841H22.7566V6.73522H24.0111V2.52442H24.8543V0.838046H25.6975V6.73522H28.6435V7.57841H25.6975V15.162H26.5407V16Z" fill="currentColor" /><path d="M19.7948 16H15.584V15.162H14.7408V14.3188H13.8976V12.6324H13.0596V10.108H13.8976V8.4216H14.7408V7.57842H15.584V6.73523H19.7948V7.57842H20.638V8.4216H21.4812V10.108H22.3244V12.6324H21.4812V14.3188H20.638V15.162H19.7948V16ZM16.4272 15.162H18.9516V14.3188H19.7948V12.6324H20.638V10.108H19.7948V8.4216H18.9516V7.57842H16.4272V8.4216H15.584V10.108H14.7408V12.6324H15.584V14.3188H16.4272V15.162Z" fill="currentColor" /><path d="M11.7892 5.89215H10.946V5.0541H10.108V4.21091H9.26478V3.36772H4.2108V2.52454H10.946V4.21091H11.7892V5.89215ZM4.2108 15.1621H2.52442V14.3189H1.68123V13.4757H0.838046V11.7893H0V6.73533H0.838046V5.0541H1.68123V4.21091H2.52442V3.36772H4.2108V4.21091H3.36761V5.0541H2.52442V6.73533H1.68123V11.7893H2.52442V13.4757H3.36761V14.3189H4.2108V15.1621ZM10.946 16.0001H4.2108V15.1621H9.26478V14.3189H10.108V13.4757H10.946V12.6325H11.7892V14.3189H10.946V16.0001Z" fill="currentColor" /></svg>
              </a>
              <div className="flex items-center gap-4 lg:gap-6">
                <a data-slot="button" className="items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] hidden lg:block pb-0.25" href="/testapage/pricing">Pricing</a>
                <div className="gap-2 flex items-center">
                  <a data-slot="button" className="items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 cursor-pointer h-9 px-4 pb-2 pt-1.75 has-[>svg]:px-3 text-[15px] tracking-15 leading-[140%] hidden lg:block" href="https://app.cofounder.co">Log in</a>
                  <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer bg-primary text-primary-foreground hover:text-shadow btn-default-shadow border border-neutral-700 h-9 px-4 pb-2 pt-1.75 group relative overflow-hidden relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 primary-button-hover-bg" />
                    <div className="relative w-full h-full z-10 flex items-center justify-center">
                      <a href="https://app.cofounder.co">Sign up</a>
                    </div>
                  </span>
                </div>
                <button className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-neutral-100 focus:ring-offset-2 group cursor-pointer lg:hidden" aria-label="Toggle menu">
                  <span className="block w-3.25 h-0.25 bg-neutral-700 group-hover:bg-neutral-900 rounded-full transition-all duration-220 ease-in-out origin-center rotate-0 translate-y-0" />
                  <span className="block w-3.25 h-0.25 bg-neutral-700 group-hover:bg-neutral-900 rounded-full transition-all duration-160 ease-in-out origin-center opacity-100 scale-100 mt-1" />
                  <span className="block w-3.25 h-0.25 bg-neutral-700 group-hover:bg-neutral-900 rounded-full transition-all duration-220 ease-in-out origin-center rotate-0 translate-y-0 mt-1" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="block lg:hidden fixed top-0 right-0 z-[100] full-page-width h-dvh pointer-events-none">
          <div className="absolute inset-0 bg-white opacity-0" style={{opacity: 0, borderRadius: '0px 0px 0px 500%', backdropFilter: 'blur(20px)', inset: '0px 0px 100% 100%'}} />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
            <div className="flex flex-col items-center space-y-4">
              <a className="text-5xl text-neutral-600 font-medium font-mondwest [font-kerning:none] [font-feature-settings:&quot;liga&quot;_off] hover:text-neutral-900 transition-colors duration-200 opacity-0 blur-[10px] [clip-path:inset(0_100%_0_0)]" href="/testapage" style={{clipPath: 'inset(0px 0% 0px 100%)', filter: 'blur(10px)', opacity: 0}}>Home</a>
              <a className="text-5xl text-neutral-600 font-medium font-mondwest [font-kerning:none] [font-feature-settings:&quot;liga&quot;_off] hover:text-neutral-900 transition-colors duration-200 opacity-0 blur-[10px] [clip-path:inset(0_100%_0_0)]" href="/testapage/pricing" style={{clipPath: 'inset(0px 0% 0px 100%)', filter: 'blur(10px)', opacity: 0}}>Pricing</a>
              <a className="text-5xl text-neutral-600 font-medium font-mondwest [font-kerning:none] [font-feature-settings:&quot;liga&quot;_off] hover:text-neutral-900 transition-colors duration-200 opacity-0 blur-[10px] [clip-path:inset(0_100%_0_0)]" href="https://app.cofounder.co" style={{clipPath: 'inset(0px 0% 0px 100%)', filter: 'blur(10px)', opacity: 0}}>Log in</a>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 z-20 opacity-0 translate-y-20" style={{transform: 'translate(0px, 20px)', translate: 'none', rotate: 'none', scale: 'none', opacity: 0}}>
            <div className="w-full">
              <div className="px-4 w-full max-w-[1920px] mx-auto flex justify-between items-center">
                <p className="font-af-foundary font-normal text-[13px] tracking-13 leading-[130%] text-neutral-600">© Cofounder&nbsp;2025</p>
                <div className="flex gap-2">
                  <a href="https://www.linkedin.com/company/the-general-intelligence-company-of-new-york/" target="_blank" rel="noopener noreferrer" className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-neutral-100 focus:ring-offset-2 group hover:bg-secondary transition-all duration-280 ease-in-out" aria-label="Open linkedin profile"><svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none"><path d="M3.72592 4.58458H0.8125V13.8753H3.72592V4.58458Z" fill="currentColor" /><path d="M11.6066 4.38334C11.4992 4.36991 11.385 4.3632 11.2709 4.35649C9.63968 4.28936 8.72001 5.25602 8.39779 5.67222C8.31052 5.78634 8.27024 5.85347 8.27024 5.85347V4.61158H5.48438V13.9023H8.27024H8.39779C8.39779 12.9558 8.39779 12.0159 8.39779 11.0694C8.39779 10.5592 8.39779 10.0491 8.39779 9.53887C8.39779 8.90786 8.3508 8.23656 8.66631 7.65925C8.93483 7.17592 9.41815 6.93425 9.9619 6.93425C11.573 6.93425 11.6066 8.39096 11.6066 8.52522C11.6066 8.53193 11.6066 8.53865 11.6066 8.53865V13.9426H14.52V7.88078C14.52 5.80648 13.4661 4.58473 11.6066 4.38334Z" fill="currentColor" /><path d="M2.26881 3.38332C3.20308 3.38332 3.96047 2.62594 3.96047 1.69166C3.96047 0.757382 3.20308 0 2.26881 0C1.33453 0 0.577148 0.757382 0.577148 1.69166C0.577148 2.62594 1.33453 3.38332 2.26881 3.38332Z" fill="currentColor" /></svg></a>
                  <a href="https://x.com/nycintelligence" target="_blank" rel="noopener noreferrer" className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-neutral-100 focus:ring-offset-2 group hover:bg-secondary transition-all duration-280 ease-in-out" aria-label="Open x profile"><svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none"><path d="M11.453 1.18999H13.5614L8.9551 6.45467L14.374 13.6187H10.131L6.8078 9.27376L3.00524 13.6187H0.895543L5.82242 7.98755L0.624023 1.18999H4.97472L7.97864 5.16145L11.453 1.18999ZM10.713 12.3567H11.8813L4.3399 2.3857H3.08619L10.713 12.3567Z" fill="currentColor" /></svg></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="min-h-screen flex flex-col">
          <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 2xl:px-30 pt-40 pb-20">
            <div className="max-w-[760px] mx-auto">
              {/* Header */}
              <div className="mb-16">
                <h1 className="font-mondwest [font-kerning:none] [font-feature-settings:&quot;liga&quot;_off] text-neutral-900 text-[48px] leading-[100%] tracking-[-0.96px] font-normal md:text-[54px] md:leading-[110%] md:tracking-[-1.08px] mb-6">
                  Privacy Policy
                </h1>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[140%] text-neutral-600 [font-variant-numeric:lining-nums_proportional-nums]">
                  Effective Date: January 25, 2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-12">
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  This Privacy Policy describes how Cofounder ("we," "us," or "our") collects, uses, and shares information when you use our survey and form builder platform. By using our service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>

              {/* Section 1 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  1. Information We Collect
                </h2>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.1 Account Information
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  When you create an account, we collect your email address, full name, and account credentials. We also store your user ID, profile information, and subscription status (including whether you have a Pro account).
                </p>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.2 Project and Survey Data
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  We store all surveys and forms you create, including project titles, descriptions, survey schemas, question text, question types, answer options, and survey configurations. We also save preview screenshots of your surveys, published URLs, and the complete code bundles that power your surveys.
                </p>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.3 Survey Response Data
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  When respondents complete your surveys, we collect their responses, submission timestamps, respondent IDs, session IDs, and IP addresses. For fraud detection purposes, we also collect behavioral data including mouse movement patterns, keystroke timing data, timing data (how long respondents spend on each question), and device information (browser type, operating system, screen resolution).
                </p>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.4 Chat and AI Interaction Data
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  We store all conversations you have with our AI assistant, including your prompts, the AI's responses, chat session metadata, and timestamps. This helps us improve your experience and maintain conversation context.
                </p>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.5 Analytics and Fraud Detection Data
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  We calculate and store survey analytics including total response counts, completion rates, average completion times, fraud scores for each response, and flags for suspicious activity. Our fraud detection system analyzes behavioral patterns to identify potentially fraudulent survey responses.
                </p>

                <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  1.6 Technical and Usage Information
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-6">
                  We automatically collect IP addresses, browser types, device identifiers, operating system information, referring URLs, pages viewed, time spent on pages, and cookie data.
                </p>
              </div>

              {/* Section 2 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  2. How We Use Your Information
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  We use the collected information to:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Provide and maintain our survey platform service
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Generate AI-powered surveys and forms based on your requirements
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Collect and analyze survey responses on your behalf
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Detect and prevent fraudulent survey responses
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Provide analytics and insights about survey performance
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Improve our AI models and service quality
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Send you service updates, security alerts, and support messages
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Respond to your support requests and inquiries
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Comply with legal obligations and enforce our terms
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  3. AI Model Training
                </h2>

                <div className="bg-[#F3F5F2] rounded-lg p-4 mb-4">
                  <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums]">
                    Important: We may use anonymized and aggregated data from your interactions with our AI assistant to improve our models and services. We do not use your personal information, survey response data from your respondents, or any identifiable information to train AI models.
                  </p>
                </div>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  Your account data, survey content, and respondent data remain private and are not used for model training purposes.
                </p>
              </div>

              {/* Section 4 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  4. How We Share Your Information
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  We share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Service Providers:</span> We work with third-party service providers for hosting (Supabase), authentication, payment processing, and email services. These providers have access to your information only to perform specific tasks on our behalf and are obligated to protect your data.
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Legal Requirements:</span> We may disclose your information if required by law, court order, or governmental request, or to protect our rights, property, or safety.
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Business Transfers:</span> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner.
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">With Your Consent:</span> We may share your information for any other purpose with your explicit consent.
                  </li>
                </ul>

                <div className="bg-[#F3F5F2] rounded-lg p-4">
                  <p className="font-af-foundary font-medium text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums]">
                    We do not sell your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  5. Data Security
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  We implement industry-standard security measures to protect your information, including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Encryption of data in transit using TLS/SSL
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Encryption of sensitive data at rest
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Secure authentication and access controls
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Row-level security policies on database access
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Regular security audits and monitoring
                  </li>
                </ul>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>

              {/* Section 6 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  6. Data Retention
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  We retain your information for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal purposes.
                </p>
              </div>

              {/* Section 7 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  7. Your Rights and Choices
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-3">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Access:</span> Request a copy of the personal information we hold about you
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Correction:</span> Request correction of inaccurate or incomplete information
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Deletion:</span> Request deletion of your personal information
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Portability:</span> Request a copy of your data in a portable format
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Objection:</span> Object to our processing of your personal information
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    <span className="font-medium text-neutral-900">Restriction:</span> Request restriction of processing in certain circumstances
                  </li>
                </ul>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  To exercise these rights, please contact us at support@cofounder.co. We will respond to your request within 30 days.
                </p>
              </div>

              {/* Section 8 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  8. Cookies and Tracking Technologies
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Keep you logged in to your account
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Remember your preferences and settings
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Understand how you use our service
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Analyze usage patterns and improve our service
                  </li>
                </ul>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our service.
                </p>
              </div>

              {/* Section 9 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  9. Third-Party Services
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  Our service integrates with third-party services including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Supabase (database and authentication)
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Anthropic Claude (AI services)
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Payment processors (for subscription billing)
                  </li>
                </ul>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  These third parties have their own privacy policies. We encourage you to review their policies to understand how they handle your information.
                </p>
              </div>

              {/* Section 10 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  10. Children's Privacy
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately and we will delete such information.
                </p>
              </div>

              {/* Section 11 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  11. International Data Transfers
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your jurisdiction. By using our service, you consent to the transfer of your information to the United States and other countries where we operate.
                </p>
              </div>

              {/* Section 12 */}
              <div className="mb-12">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  12. Changes to This Privacy Policy
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Sending an email to the address associated with your account
                  </li>
                  <li className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Posting a prominent notice on our website
                  </li>
                </ul>
                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                  Your continued use of the service after any changes indicates your acceptance of the updated Privacy Policy.
                </p>
              </div>

              {/* Section 13 */}
              <div className="mb-16">
                <h2 className="font-af-foundary font-medium text-[17px] tracking-[-0.17px] leading-[140%] text-neutral-900 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  13. Contact Us
                </h2>

                <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>

                <div className="space-y-2">
                  <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Email: <a href="mailto:support@cofounder.co" className="text-neutral-900 underline hover:text-neutral-700">support@cofounder.co</a>
                  </p>
                  <p className="font-af-foundary font-normal text-[15px] tracking-[-0.15px] leading-[160%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
                    Address: Cofounder<br />
                    169 Madison Avenue<br />
                    New York, NY 10016<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="w-full">
          <footer id="page-footer" className="px-4 w-full max-w-[1920px] mx-auto flex flex-col items-center gap-16 pb-12 overflow-hidden">
            <div className="fixed pointer-events-none z-50" style={{left: 330, top: 230}}>
              <div style={{borderRadius: 999, border: '1px solid var(--neutral-400-stroke-light, #DEE2DE)', background: 'var(--CF-grad-neutral, linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.48) 100%))', boxShadow: '0 4px 12px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 4px 0 rgba(0, 0, 0, 0.05), 0 3px 8px 0 rgba(0, 0, 0, 0.08)', backdropFilter: 'blur(5px)', display: 'flex', width: 140, height: 140, padding: 4, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: 0, transition: 'opacity 0.3s ease-out'}}>
                <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums] text-center">Try<br /><span className="text-neutral-900">Cofounder</span></p>
              </div>
            </div>
            <a target="_blank" className="flex flex-col items-center gap-9 hover:cursor-none" href="https://app.cofounder.co">
              <div className="flex flex-col items-center max-w-[420px] md:max-w-[640px] gap-7 mx-auto">
                <h2 className="font-mondwest font-normal tracking-15 text-[40px] sm:text-[48px] md:text-[70px] text-center tracking-140 leading-[100%]">Automate your life with natural language</h2>
                <div className="flex items-center gap-1.5">
                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">by The General Intelligence Company</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-5">
                <img alt="Cofounder" width={273} height={173} style={{color: 'transparent'}} src="/testapage/assets/poststamp.png" />
                <div className="flex items-center gap-2">
                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">Made with</p>
                  <img alt="Heart" width="11.5" height="12.5" style={{color: 'transparent'}} src="/testapage/assets/heart.svg" />
                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">in New York</p>
                </div>
              </div>
            </a>
            <div className="flex flex-col items-center justify-between gap-5 w-full md:px-4 lg:px-8 2xl:px-26">
              <div className="flex items-end justify-between gap-2 w-full">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <a data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="/testapage">Home</a>
                    <a data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="/testapage/pricing">Pricing</a>
                    <a data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="/testapage/privacy-policy">Privacy Policy</a>
                    <a data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="/testapage/terms-of-service">Terms of Service</a>
                    <a target="_blank" data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="https://docs.cofounder.co">Docs</a>
                    <a target="_blank" data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%]" href="https://www.generalintelligencecompany.com/">Company</a>
                  </div>
                </div>
                <div className="flex gap-2 mb-1">
                  <a href="https://www.linkedin.com/company/the-general-intelligence-company-of-new-york/" target="_blank" rel="noopener noreferrer" className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-neutral-100 focus:ring-offset-2 group hover:bg-secondary transition-all duration-280 ease-in-out" aria-label="Open linkedin profile"><svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none"><path d="M3.72592 4.58458H0.8125V13.8753H3.72592V4.58458Z" fill="currentColor" /><path d="M11.6066 4.38334C11.4992 4.36991 11.385 4.3632 11.2709 4.35649C9.63968 4.28936 8.72001 5.25602 8.39779 5.67222C8.31052 5.78634 8.27024 5.85347 8.27024 5.85347V4.61158H5.48438V13.9023H8.27024H8.39779C8.39779 12.9558 8.39779 12.0159 8.39779 11.0694C8.39779 10.5592 8.39779 10.0491 8.39779 9.53887C8.39779 8.90786 8.3508 8.23656 8.66631 7.65925C8.93483 7.17592 9.41815 6.93425 9.9619 6.93425C11.573 6.93425 11.6066 8.39096 11.6066 8.52522C11.6066 8.53193 11.6066 8.53865 11.6066 8.53865V13.9426H14.52V7.88078C14.52 5.80648 13.4661 4.58473 11.6066 4.38334Z" fill="currentColor" /><path d="M2.26881 3.38332C3.20308 3.38332 3.96047 2.62594 3.96047 1.69166C3.96047 0.757382 3.20308 0 2.26881 0C1.33453 0 0.577148 0.757382 0.577148 1.69166C0.577148 2.62594 1.33453 3.38332 2.26881 3.38332Z" fill="currentColor" /></svg></a>
                  <a href="https://x.com/nycintelligence" target="_blank" rel="noopener noreferrer" className="relative w-9 h-9 flex flex-col justify-center items-center rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-neutral-100 focus:ring-offset-2 group hover:bg-secondary transition-all duration-280 ease-in-out" aria-label="Open x profile"><svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" fill="none"><path d="M11.453 1.18999H13.5614L8.9551 6.45467L14.374 13.6187H10.131L6.8078 9.27376L3.00524 13.6187H0.895543L5.82242 7.98755L0.624023 1.18999H4.97472L7.97864 5.16145L11.453 1.18999ZM10.713 12.3567H11.8813L4.3399 2.3857H3.08619L10.713 12.3567Z" fill="currentColor" /></svg></a>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex flex-col items-start gap-1">
                  <p className="font-af-foundary font-normal text-[13px] tracking-13 leading-[130%] text-neutral-600">Copyright © {/* */}2025{/* */} The General Intelligence Company Of New York</p>
                </div>
                <div>
                  <p className="font-af-foundary font-normal text-[13px] tracking-13 leading-[130%] text-neutral-600">Design by{/* */} <a data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[13px] tracking-13 leading-[130%] pb-0.25 border-b border-neutral-600 hover:border-neutral-900 rounded-none" color="neutral-700" href="https://altalogy.com?rel=gic-cofounder">Altalogy</a></p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
