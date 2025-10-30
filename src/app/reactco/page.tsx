import type { Metadata } from 'next';
import './reactco.css';

export const metadata: Metadata = {
  title: 'Cofounder',
  description: 'Automate your life with natural language. Cofounder plugs into your existing tools, writes automations, and organizes workflows.',
};

export default function ReactCoPage() {
  return (
    <div className="__variable_5567bd __variable_12efe5 __variable_9a8899 antialiased bg-neutral-50 text-neutral-900">
      <main className="flex flex-row h-screen pt-20">
        <div className="flex flex-col w-[var(--sidebar-width)] border-r border-[#DEE2DE] h-full justify-between pt-6 pb-12 pl-20 pr-12 fixed top-0 left-0 gap-12 hidden lg:flex bg-neutral-50 z-52">
          <img
            alt="Cofounder"
            loading="lazy"
            width={74}
            height={142}
            decoding="async"
            className="-ml-3 transition-opacity duration-700 ease-out"
            style={{ color: 'transparent' }}
            src="/cofounder-assets/cofunder-logo-flower.avif"
          />
          <div
            className="logo-context-menu fixed bg-neutral-50 rounded-lg p-2 shadow-md border"
            style={{
              top: 0,
              left: 0,
              zIndex: -1,
              opacity: 0,
              transform: 'scale(0.95)'
            }}
          >
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download logo as PNG
              </p>
            </div>
            <hr className="border-neutral-400 my-0.25" />
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download wordmark as PNG
              </p>
            </div>
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download wordmark as SVG
              </p>
            </div>
          </div>
          <div className="flex flex-col full-page-width gap-2 transition-opacity duration-700 ease-out">
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#cofounder"
            >
              Cofounder
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#use-cases"
            >
              Use cases
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#product"
            >
              Product
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#agents"
            >
              Agents
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#integrations"
            >
              Integrations
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#results"
            >
              Results
            </a>
            <a
              data-slot="button"
              className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1"
              href="#blog"
            >
              Blog
            </a>
          </div>
        </div>
        <div className="flex-1 lg:pl-[var(--sidebar-width)] max-w-full">
          <nav className="fixed top-0 z-[102] bg-neutral-50/90 backdrop-blur-sm transition-[min-height] duration-180 ease-in-out sidebar-page-width">
            <div className="w-full">
              <div className="2xl:px-30 xl:px-12 md:px-8 px-5 max-w-[1920px] mx-auto w-full flex items-center justify-between py-2 min-h-20">
                <a
                  className="text-neutral-900 hover:text-neutral-700 transition-colors"
                  href="/"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={120}
                    height={30}
                    viewBox="0 0 86 16"
                    fill="none"
                  >
                    <path
                      d="M81.6948 15.9999H78.3271V15.1618H79.1652V8.42147H78.3271V7.57828H79.1652V6.73509H80.0084V5.89191H80.8516V7.57828H81.6948V8.42147H80.8516V15.1618H81.6948V15.9999ZM85.0624 8.42147H83.3811V7.57828H81.6948V6.73509H85.0624V8.42147Z"
                      fill="currentColor"
                    />
                    <path
                      d="M75.7972 16H71.5864V15.162H70.7432V14.3188H69.9001V12.6324H69.062V10.108H69.9001V8.4216H70.7432V9.26479H75.7972V8.4216H74.954V7.57842H71.5864V6.73523H75.7972V7.57842H76.6404V8.4216H77.4836V10.108H70.7432V12.6324H71.5864V14.3188H72.4296V15.162H75.7972V16ZM71.5864 8.4216H70.7432V7.57842H71.5864V8.4216ZM77.4836 14.3188H76.6404V13.4756H77.4836V14.3188ZM76.6404 15.162H75.7972V14.3188H76.6404V15.162Z"
                      fill="currentColor"
                    />
                    <path
                      d="M68.6503 16H66.1207V15.162H65.2775V14.3188H66.1207V8.42159H65.2775V7.57841H66.1207V2.52442H65.2775V1.68123H66.1207V0.838046H66.9639V0H67.8071V15.162H68.6503V16ZM65.2775 16H61.9099V15.162H61.0667V14.3188H60.2235V12.6324H59.3855V10.108H60.2235V8.42159H61.0667V7.57841H61.9099V6.73522H65.2775V7.57841H62.7531V8.42159H61.9099V10.108H61.0667V12.6324H61.9099V14.3188H62.7531V15.162H65.2775V16Z"
                      fill="currentColor"
                    />
                    <path
                      d="M52.2128 15.9999H48.8452V15.1618H49.6833V8.42147H48.8452V7.57828H49.6833V6.73509H50.5264V5.89191H51.3696V7.57828H52.2128V8.42147H51.3696V15.1618H52.2128V15.9999ZM58.5316 15.9999H55.1588V15.1618H56.002V8.42147H55.1588V7.57828H52.2128V6.73509H56.002V7.57828H56.8452V8.42147H57.6884V15.1618H58.5316V15.9999Z"
                      fill="currentColor"
                    />
                    <path
                      d="M43.7859 16H40.8399V15.162H39.9967V14.3188H39.1535V7.57842H38.3154V6.73523H40.8399V14.3188H41.683V15.162H43.7859V16ZM48.0018 16H45.4722V14.3188H44.6291V13.4756H45.4722V7.57842H44.6291V6.73523H47.1586V15.162H48.0018V16ZM44.6291 15.162H43.7859V14.3188H44.6291V15.162Z"
                      fill="currentColor"
                    />
                    <path
                      d="M35.3639 16H31.1531V15.162H30.3099V14.3188H29.4667V12.6324H28.6287V10.108H29.4667V8.4216H30.3099V7.57842H31.1531V6.73523H35.3639V7.57842H36.2071V8.4216H37.0503V10.108H37.8934V12.6324H37.0503V14.3188H36.2071V15.162H35.3639V16ZM31.9963 15.162H34.5207V14.3188H35.3639V12.6324H36.2071V10.108H35.3639V8.4216H34.5207V7.57842H31.9963V8.4216H31.1531V10.108H30.3099V12.6324H31.1531V14.3188H31.9963V15.162Z"
                      fill="currentColor"
                    />
                    <path
                      d="M29.9083 2.52442H28.227V0.838046H25.6975V0H29.0651V0.838046H29.9083V2.52442ZM26.5407 16H23.173V15.162H24.0111V7.57841H22.7566V6.73522H24.0111V2.52442H24.8543V0.838046H25.6975V6.73522H28.6435V7.57841H25.6975V15.162H26.5407V16Z"
                      fill="currentColor"
                    />
                    <path
                      d="M19.7948 16H15.584V15.162H14.7408V14.3188H13.8976V12.6324H13.0596V10.108H13.8976V8.4216H14.7408V7.57842H15.584V6.73523H19.7948V7.57842H20.638V8.4216H21.4812V10.108H22.3244V12.6324H21.4812V14.3188H20.638V15.162H19.7948V16ZM16.4272 15.162H18.9516V14.3188H19.7948V12.6324H20.638V10.108H19.7948V8.4216H18.9516V7.57842H16.4272V8.4216H15.584V10.108H14.7408V12.6324H15.584V14.3188H16.4272V15.162Z"
                      fill="currentColor"
                    />
                    <path
                      d="M11.7892 5.89215H10.946V5.0541H10.108V4.21091H9.26478V3.36772H4.2108V2.52454H10.946V4.21091H11.7892V5.89215ZM4.2108 15.1621H2.52442V14.3189H1.68123V13.4757H0.838046V11.7893H0V6.73533H0.838046V5.0541H1.68123V4.21091H2.52442V3.36772H4.2108V4.21091H3.36761V5.0541H2.52442V6.73533H1.68123V11.7893H2.52442V13.4757H3.36761V14.3189H4.2108V15.1621ZM10.946 16.0001H4.2108V15.1621H9.26478V14.3189H10.108V13.4757H10.946V12.6325H11.7892V14.3189H10.946V16.0001Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <div className="flex items-center gap-4 lg:gap-6">
                  <a
                    data-slot="button"
                    className="items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] hidden lg:block pb-0.25"
                    href="/pricing"
                  >
                    Pricing
                  </a>
                  <div className="gap-2 flex items-center">
                    <a
                      data-slot="button"
                      className="items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 cursor-pointer h-9 px-4 pb-2 pt-1.75 has-[>svg]:px-3 text-[15px] tracking-15 leading-[140%] hidden lg:block"
                      href="https://app.cofounder.co"
                    >
                      Log in
                    </a>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 primary-button-hover-bg"></div>
                    <div className="relative w-full h-full z-10 flex items-center justify-center">
                      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer bg-primary text-primary-foreground hover:text-shadow btn-default-shadow border border-neutral-700 h-9 px-4 pb-2 pt-1.75 group relative overflow-hidden relative inline-flex items-center justify-center">
                        <a href="https://app.cofounder.co">Sign up</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="w-full">
            <header className="xl:pb-20 pb-8 xl:pt-20 pt-8 2xl:px-30 xl:px-12 md:px-8 px-5 w-full max-w-[1920px] mx-auto delay-0" id="cofounder">
              <div className="flex flex-col gap-12">
                <h1 className="home-hero-title font-mondwest [font-kerning:none] [font-feature-settings:'liga'_off] text-neutral-900 text-[48px] leading-none tracking-[-0.96px] max-w-[520px] w-full sm:text-[54px] sm:leading-[110%] sm:tracking-[-1.08px] sm:max-w-[620px] xl:text-[70px] xl:leading-none xl:tracking-[-1.4px] xl:max-w-[720px] 3xl:text-[90px] 3xl:leading-none 3xl:tracking-[-1.8px] 3xl:max-w-[820px]">
                  Automate your life with natural language
                </h1>
                <div className="flex flex-col gap-6">
                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800 max-w-[482px]">
                    Cofounder plugs into your existing tools, writes automations, and organizes workflows. Driving the software you're already familiar with.
                  </p>
                </div>
              </div>
            </header>
          </div>

          <footer className="w-full">
            <div className="pb-8 pt-14 px-4 w-full max-w-[1920px] mx-auto flex flex-col gap-8">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex flex-col items-start gap-1">
                  <p className="font-af-foundary font-normal text-[13px] tracking-13 leading-[130%] text-neutral-600">
                    Copyright © 2025 The General Intelligence Company Of New York
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

