"use client";

import "./paradigm.css";

export default function ParadigmPage() {
  return (
    <div
      style={{
        background: '#080B12',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'PP Neue Montreal, Helvetica Neue, Arial, sans-serif',
      }}
      dangerouslySetInnerHTML={{
        __html: `
      <div class="Root_wrapper__yd5yO ready" style="--color-black: #080B12; --color-white: #fff; --color-white-absolute: #fff; --color-black-absolute: #000; --color-blue: #0a33ff; --color-surface-gray: #080B12; --color-text-white-alpha-70: rgba(255,255,255,0.7); --font-neue-montreal: 'PP Neue Montreal', 'Helvetica Neue', Arial, sans-serif; --font-atacama: 'Atacama VAR', Palatino, Garamond, serif;">
        <header class="Header_header__eDAqj dark" data-dropdown-open="false">
          <div class="Header_container__C_tPB">
            <a class="Header_logo_container__FoHca" aria-label="Surbee home" href="/">
              <svg width="191" height="24" viewBox="0 0 191 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5273 1.88794C19.9293 1.88794 20.2557 2.21354 20.2559 2.61548V16.3694C20.2557 16.5599 20.1804 16.7431 20.0469 16.8792L15.6992 21.3098C15.5624 21.4492 15.375 21.5275 15.1797 21.5276H1.68945C1.28741 21.5276 0.961055 21.2021 0.960938 20.8V7.15454C0.961003 6.96399 1.03553 6.78083 1.16895 6.64478L5.62402 2.10571C5.76092 1.96636 5.9482 1.88794 6.14355 1.88794H19.5273ZM6.40137 7.03247C6.20054 7.03264 6.03823 7.19589 6.03809 7.39673V16.0208C6.03809 16.2217 6.20045 16.3848 6.40137 16.385H14.8145C15.0155 16.385 15.1787 16.2218 15.1787 16.0208V7.39673C15.1786 7.19579 15.0154 7.03247 14.8145 7.03247H6.40137Z" fill="var(--color-white-absolute)"></path>
                <path d="M33.1693 11.3134C34.1255 11.3134 34.8802 11.0881 35.4334 10.6373C35.9934 10.1797 36.2734 9.53771 36.2734 8.71131C36.2734 7.88491 36.0071 7.25999 35.4744 6.83655C34.9416 6.41311 34.1938 6.20138 33.2308 6.20138H30.6901V11.3134H33.1693ZM28.1597 19.0583V4.08075H33.4459C35.0577 4.08075 36.3554 4.51444 37.3389 5.38182C38.3224 6.24919 38.8141 7.35219 38.8141 8.69082C38.8141 9.57869 38.5751 10.3846 38.097 11.1085C37.6257 11.8325 36.9735 12.4028 36.1403 12.8194C35.3139 13.2292 34.3953 13.4341 33.3845 13.4341H30.6901V19.0583H28.1597ZM39.7365 11.5286C39.8116 11.0778 39.9585 10.6441 40.177 10.2275C40.3956 9.8109 40.6859 9.42502 41.0478 9.06987C41.4098 8.71472 41.8708 8.43129 42.4308 8.21957C42.9909 8.00102 43.609 7.89174 44.2851 7.89174C44.9818 7.89174 45.5964 7.9737 46.1291 8.13761C46.6687 8.30153 47.1058 8.52349 47.4405 8.80351C47.7819 9.0767 48.062 9.41136 48.2805 9.80748C48.4991 10.1968 48.6493 10.6031 48.7313 11.0266C48.8201 11.4432 48.8645 11.8974 48.8645 12.3891V16.5587C48.8645 17.6719 48.9191 18.5051 49.0284 19.0583H46.5492C46.5082 18.6349 46.4877 18.208 46.4877 17.7778V17.2758H46.4672C46.3648 17.5217 46.2316 17.7539 46.0677 17.9724C45.9106 18.191 45.6989 18.4095 45.4325 18.6281C45.1662 18.8466 44.8247 19.0174 44.4081 19.1403C43.9983 19.2701 43.5373 19.335 43.025 19.335C41.8435 19.335 40.9112 19.0242 40.2283 18.4027C39.5521 17.7744 39.214 17.006 39.214 16.0977C39.214 15.804 39.2516 15.5308 39.3267 15.2781C39.4019 15.0254 39.4941 14.8034 39.6033 14.6122C39.7126 14.4141 39.8629 14.2331 40.0541 14.0692C40.2453 13.8985 40.4263 13.7551 40.5971 13.639C40.7746 13.5229 40.9932 13.4136 41.2527 13.3111C41.5122 13.2087 41.7342 13.1301 41.9186 13.0755C42.1098 13.014 42.3489 12.956 42.6357 12.9013C42.9226 12.8399 43.1446 12.7955 43.3016 12.7682C43.4587 12.7409 43.667 12.7101 43.9266 12.676C44.1929 12.635 44.3705 12.6077 44.4593 12.594C45.1901 12.4847 45.7057 12.3345 46.0062 12.1432C46.3135 11.952 46.4672 11.6344 46.4672 11.1905C46.4672 10.7602 46.276 10.4187 45.8935 10.166C45.5111 9.91334 44.9886 9.78699 44.3261 9.78699C43.7387 9.78699 43.2436 9.94408 42.8406 10.2582C42.4377 10.5656 42.1713 10.989 42.0416 11.5286H39.7365ZM42.1645 14.981C41.8025 15.2337 41.6215 15.5786 41.6215 16.0157C41.6215 16.4528 41.7991 16.8114 42.1542 17.0914C42.5162 17.3646 43.0114 17.5012 43.6397 17.5012C44.0222 17.5012 44.3773 17.4397 44.7051 17.3168C45.033 17.187 45.3335 16.9924 45.6067 16.7328C45.8867 16.4733 46.1052 16.1113 46.2623 15.6469C46.4262 15.1825 46.5082 14.6395 46.5082 14.018V12.8911C46.3784 13.2326 46.1189 13.5263 45.7296 13.7721C45.3403 14.0112 44.7188 14.2127 43.8651 14.3766C43.1002 14.52 42.5333 14.7215 42.1645 14.981ZM53.3213 8.20932V10.2275C53.8403 8.83424 54.9262 8.12737 56.579 8.10688V10.4119C56.0736 10.4119 55.7082 10.4461 55.4829 10.5144C55.2438 10.5622 55.0321 10.6236 54.8477 10.6988C54.6633 10.7739 54.4755 10.8968 54.2843 11.0676C54.093 11.2315 53.9325 11.4398 53.8028 11.6925C53.6798 11.9384 53.5774 12.2696 53.4954 12.6862C53.4135 13.096 53.3725 13.5707 53.3725 14.1102V19.0583H50.9343V8.20932H53.3213ZM57.358 11.5286C57.4332 11.0778 57.58 10.6441 57.7986 10.2275C58.0171 9.8109 58.3074 9.42502 58.6693 9.06987C59.0313 8.71472 59.4923 8.43129 60.0524 8.21957C60.6124 8.00102 61.2305 7.89174 61.9066 7.89174C62.6033 7.89174 63.2179 7.9737 63.7507 8.13761C64.2902 8.30153 64.7273 8.52349 65.062 8.80351C65.4035 9.0767 65.6835 9.41136 65.902 9.80748C66.1206 10.1968 66.2708 10.6031 66.3528 11.0266C66.4416 11.4432 66.486 11.8974 66.486 12.3891V16.5587C66.486 17.6719 66.5406 18.5051 66.6499 19.0583H64.1707C64.1297 18.6349 64.1092 18.208 64.1092 17.7778V17.2758H64.0887C63.9863 17.5217 63.8531 17.7539 63.6892 17.9724C63.5321 18.191 63.3204 18.4095 63.054 18.6281C62.7877 18.8466 62.4462 19.0174 62.0296 19.1403C61.6198 19.2701 61.1588 19.335 60.6466 19.335C59.465 19.335 58.5328 19.0242 57.8498 18.4027C57.1736 17.7744 56.8356 17.006 56.8356 16.0977C56.8356 15.804 56.8731 15.5308 56.9483 15.2781C57.0234 15.0254 57.1156 14.8034 57.2249 14.6122C57.3341 14.4141 57.4844 14.2331 57.6756 14.0692C57.8669 13.8985 58.0478 13.7551 58.2186 13.639C58.3962 13.5229 58.6147 13.4136 58.8742 13.3111C59.1338 13.2087 59.3557 13.1301 59.5401 13.0755C59.7314 13.014 59.9704 12.956 60.2573 12.9013C60.5441 12.8399 60.7661 12.7955 60.9232 12.7682C61.0802 12.7409 61.2885 12.7101 61.5481 12.676C61.8144 12.635 61.992 12.6077 62.0808 12.594C62.8116 12.4847 63.3272 12.3345 63.6277 12.1432C63.9351 11.952 64.0887 11.6344 64.0887 11.1905C64.0887 10.7602 63.8975 10.4187 63.515 10.166C63.1326 9.91334 62.6101 9.78699 61.9476 9.78699C61.3603 9.78699 60.8651 9.94408 60.4622 10.2582C60.0592 10.5656 59.7928 10.989 59.6631 11.5286H57.358ZM59.786 14.981C59.424 15.2337 59.243 15.5786 59.243 16.0157C59.243 16.4528 59.4206 16.8114 59.7758 17.0914C60.1377 17.3646 60.6329 17.5012 61.2612 17.5012C61.6437 17.5012 61.9988 17.4397 62.3267 17.3168C62.6545 17.187 62.955 16.9924 63.2282 16.7328C63.5082 16.4733 63.7268 16.1113 63.8838 15.6469C64.0478 15.1825 64.1297 14.6395 64.1297 14.018V12.8911C64 13.2326 63.7404 13.5263 63.3511 13.7721C62.9618 14.0112 62.3403 14.2127 61.4866 14.3766C60.7217 14.52 60.1548 14.7215 59.786 14.981ZM72.92 7.94297C73.7874 7.94297 74.5284 8.16835 75.1431 8.61911C75.7646 9.06987 76.1846 9.58552 76.4031 10.166H76.4236V4.08075H78.9028V19.0583H76.3827V17.1938H76.3622C76.1368 17.747 75.7202 18.2422 75.1123 18.6793C74.5113 19.1164 73.7805 19.335 72.92 19.335C71.4311 19.335 70.2188 18.8091 69.2832 17.7573C68.3475 16.7055 67.8796 15.3225 67.8796 13.6082C67.8796 11.9076 68.3441 10.5383 69.2729 9.50014C70.2086 8.46202 71.4243 7.94297 72.92 7.94297ZM70.2974 13.6082C70.2974 14.7215 70.5671 15.6298 71.1067 16.3333C71.6531 17.0299 72.4248 17.3782 73.422 17.3782C73.941 17.3782 74.4055 17.2758 74.8152 17.0709C75.225 16.866 75.5528 16.586 75.7987 16.2308C76.0514 15.8757 76.2427 15.4762 76.3724 15.0322C76.5022 14.5883 76.5671 14.1136 76.5671 13.6082C76.5671 13.1233 76.4988 12.6623 76.3622 12.2252C76.2324 11.7813 76.0412 11.3851 75.7885 11.0368C75.5358 10.6885 75.2045 10.4119 74.7947 10.207C74.385 9.9953 73.9274 9.88944 73.422 9.88944C72.4453 9.88944 71.6804 10.2378 71.1272 10.9344C70.574 11.631 70.2974 12.5223 70.2974 13.6082ZM83.626 6.46774H81.0853V4.08075H83.626V6.46774ZM81.0648 19.0583V8.20932H83.5031V19.0583H81.0648ZM93.5944 8.20932H96.1146V18.0134C96.1146 18.8739 95.9711 19.6355 95.6843 20.2979C95.3974 20.9673 95.0013 21.5034 94.4959 21.9063C93.9974 22.3093 93.4339 22.6132 92.8056 22.8181C92.1772 23.023 91.5011 23.1255 90.7771 23.1255C89.3361 23.1255 88.1443 22.784 87.2018 22.101C86.2661 21.418 85.73 20.5165 85.5934 19.3964H87.9906C88.1818 20.6121 89.1107 21.22 90.7771 21.22C91.6582 21.22 92.348 20.9775 92.8465 20.4926C93.3451 20.0077 93.5944 19.2701 93.5944 18.2798V16.9582H93.5739C93.0139 18.372 91.8801 19.0788 90.1727 19.0788C88.677 19.0788 87.4613 18.5666 86.5256 17.5421C85.5968 16.5109 85.1324 15.1552 85.1324 13.475C85.1324 11.8018 85.5934 10.4631 86.5154 9.45917C87.4374 8.44837 88.6565 7.94297 90.1727 7.94297C91.0537 7.94297 91.7845 8.1342 92.365 8.51666C92.9456 8.89913 93.3485 9.36355 93.5739 9.90993H93.5944V8.20932ZM87.5501 13.475C87.5501 14.1375 87.6594 14.7385 87.8779 15.2781C88.0965 15.8108 88.4482 16.2513 88.9331 16.5996C89.418 16.9411 89.9985 17.1119 90.6747 17.1119C91.1118 17.1119 91.5079 17.0367 91.8631 16.8865C92.225 16.7362 92.5221 16.5416 92.7543 16.3026C92.9866 16.0567 93.1812 15.7732 93.3383 15.4523C93.4954 15.1313 93.6081 14.8068 93.6764 14.479C93.7447 14.1512 93.7788 13.8165 93.7788 13.475C93.7788 13.0653 93.7105 12.6555 93.5739 12.2457C93.4441 11.8359 93.2529 11.4534 93.0002 11.0983C92.7543 10.7363 92.4265 10.4461 92.0167 10.2275C91.6138 10.0021 91.1664 9.88944 90.6747 9.88944C90.0122 9.88944 89.4385 10.0602 88.9536 10.4017C88.4755 10.7432 88.1204 11.1803 87.8882 11.713C87.6628 12.2457 87.5501 12.8331 87.5501 13.475ZM98.2766 19.0583V8.20932H100.664V10.0124C100.827 9.45917 101.166 8.97425 101.678 8.55764C102.19 8.1342 102.805 7.92248 103.522 7.92248C104.307 7.92248 104.953 8.09322 105.458 8.43471C105.963 8.76936 106.346 9.28842 106.605 9.99188C106.926 9.29525 107.329 8.77619 107.814 8.43471C108.306 8.09322 108.924 7.92248 109.669 7.92248C110.966 7.92248 111.946 8.32202 112.609 9.12109C113.278 9.91334 113.613 10.9651 113.613 12.2764V19.0583H111.205V12.7887C111.205 11.9145 111.052 11.2349 110.744 10.75C110.437 10.2582 109.966 10.0124 109.331 10.0124C108.668 10.0124 108.135 10.347 107.732 11.0163C107.329 11.6857 107.128 12.6247 107.128 13.8336V19.0583H104.761V12.7887C104.761 11.8666 104.628 11.1734 104.362 10.709C104.102 10.2446 103.621 10.0124 102.917 10.0124C101.449 10.0124 100.715 11.3476 100.715 14.018V19.0583H98.2766Z" fill="var(--color-white-absolute)"></path>
              </svg>
            </a>
            <nav aria-label="Main" data-orientation="horizontal" dir="ltr" class="Header_nav__f2MAs">
              <div style="position:relative">
                <ul data-orientation="horizontal" class="Header_nav_list__nSicT" dir="ltr">
                  <li>
                    <button data-state="closed" aria-expanded="false">
                      <div class="Header_nav_item__NfT0M Header_resource__XKsnO Header_nav_trigger__dXeYH">
                        Solutions
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" class="icon">
                          <path d="M7 3L4 6L1 3" stroke="var(--text-color)" stroke-linecap="square"></path>
                        </svg>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button data-state="closed" aria-expanded="false">
                      <div class="Header_nav_item__NfT0M Header_resource__XKsnO Header_nav_trigger__dXeYH">
                        Product
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" class="icon">
                          <path d="M7 3L4 6L1 3" stroke="var(--text-color)" stroke-linecap="square"></path>
                        </svg>
                      </div>
                    </button>
                  </li>
                  <li><a class="Header_nav_item__NfT0M" href="/templates">Templates</a></li>
                  <li><a class="Header_nav_item__NfT0M" href="/careers">Careers</a></li>
                  <li><a class="Header_nav_item__NfT0M" href="/blog">Blog</a></li>
                  <li><a class="Header_nav_item__NfT0M" href="/pricing">Pricing</a></li>
                </ul>
              </div>
            </nav>
            <div class="Header_actions__fWU2C">
              <a href="/login" class="Header_cta__lMuDZ Header_login___vSOc">Log in</a>
              <a href="/login" class="Header_cta__lMuDZ">
                <button class="Button_button__8B4nB body Header_sign_up__HFlh4 dark outline">
                  <span>Sign up</span>
                </button>
              </a>
              <button class="Header_menu_mobile_button__hr4Dk">
                <div class="Header_bar__vO_JW top_bar"></div>
                <div class="Header_bar__vO_JW bottom_bar"></div>
              </button>
            </div>
          </div>
        </header>
        <section class="HeroSection_hero__MpuRV">
          <div>
            <div class="HeroSection_container__z36V8">
              <div class="HeroSection_top__SlNTc">
                <div class="HeroSection_content__Z3NWj">
                  <h1 class="HeroSection_title__r1ung heading_1">
                    The survey platform to automate research data collection
                  </h1>
                  <h2 class="HeroSection_description__qiMon body">
                    A workspace to create, distribute, and analyze surveys with human-level precision.
                  </h2>
                  <div class="HeroSection_button_container__RfDt0">
                    <a href="/login">
                      <button class="Button_button__8B4nB body dark filled">
                        <span>Try it now</span>
                      </button>
                    </a>
                    <a href="/book-demo">
                      <button class="Button_button__8B4nB body dark outline Button_withArrow__tTKwT">
                        <span>Request a Demo</span>
                      </button>
                    </a>
                  </div>
                </div>
              </div>
              <div class="HeroSection_bottom__eKadg">
                <div class="HeroSection_grid__HruV9 HeroSection_grid_mask__FGSQI">
                  ${Array(96).fill('<div aria-hidden="true" class="HeroSection_cell__lVF0h HeroSection_cell_gradient__9rlZi"></div>').join('')}
                </div>
                <div class="HeroSection_grid__HruV9 HeroSection_grid_overlay__AByYu">
                  ${Array(96).fill('<div aria-hidden="true" class="HeroSection_cell__lVF0h"></div>').join('')}
                </div>
                <div class="HeroSection_sheet_image_container__pdX10">
                  <div style="display:contents" aria-hidden="true">
                    <div style="max-width:1000px;width:100%;height:auto;max-height:424px"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div class="Home_gradient_wrapper__ndCXg">
          <section class="TrustedSection_section__bRc6I">
            <div class="TrustedSection_slider__B11dN" style="--items-nb:6">
              <p class="TrustedSection_title__BKrgy body">Trusted by industry leaders at</p>
              <div class="TrustedSection_container__SmPBc">
                <div class="TrustedSection_container_inner__Lljxx">
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">Stanford</div></div>
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">MIT</div></div>
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">Harvard</div></div>
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">Google</div></div>
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">Meta</div></div>
                  <div class="TrustedSection_item__dZNTA"><div class="TrustedSection_item_image__xL567" style="width:150px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--color-text-white-alpha-70)">Microsoft</div></div>
                </div>
              </div>
            </div>
          </section>
          <section class="TryPreviewSection_try_preview_section__BG6_9">
            <div class="TryPreviewSection_hero_inner__7SNO_">
              <div class="TryPreviewSection_content__WATCD">
                <h2 class="TryPreviewSection_title__acVoC heading_2">Try a preview now</h2>
                <p class="TryPreviewSection_subtitle__3mJxI body_16">Turn any question into a structured survey. Create one—no account needed.</p>
              </div>
              <div class="TryPreviewSection_prompt_section__gp_Hw">
                <div class="TryPreviewSection_prompt_container__vOeIR">
                  <form class="PromptTextArea_prompt_input__uaLYK">
                    <textarea placeholder="Generate a Surbee survey" class="PromptTextArea_input__txVsx" style="height:100%;resize:none"></textarea>
                    <button type="submit" class="PromptTextArea_submit_button__6caqR PromptTextArea_disabled__StM0l" aria-label="Submit prompt" disabled>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="icon PromptTextArea_arrow_icon__iL3Yb">
                        <path d="M1 10.75L11 1.25M11 1.25V8.25M11 1.25H4" stroke="var(--color-white)"></path>
                      </svg>
                    </button>
                  </form>
                </div>
                <div class="TryPreviewSection_chips_wrapper__Wc6dx">
                  <div class="PromptChips_chips_container__u1Sl8">
                    <div class="PromptChips_chip_wrapper__Ge2u_"><button type="button" class="PromptChips_chip__QqrGp">Customer Feedback</button></div>
                    <div class="PromptChips_chip_wrapper__Ge2u_"><button type="button" class="PromptChips_chip__QqrGp">Market Research</button></div>
                    <div class="PromptChips_chip_wrapper__Ge2u_"><button type="button" class="PromptChips_chip__QqrGp">Employee Engagement</button></div>
                    <div class="PromptChips_chip_wrapper__Ge2u_"><button type="button" class="PromptChips_chip__QqrGp">Product Testing</button></div>
                    <div class="PromptChips_chip_wrapper__Ge2u_"><button type="button" class="PromptChips_chip__QqrGp">Academic</button></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div class="StepsSection_container__pTLa1">
              <div class="StepsSection_header__L3RoP">
                <h2 class="StepsSection_title___6onm heading_2">A workspace to transform your data</h2>
                <p class="StepsSection_subtitle__UxMjv body_16">Create surveys from any prompt and watch insights instantly flow into your workspace.</p>
              </div>
              <div class="StepsSection_steps__O_1_l">
                <div class="StepsSection_step_indicators__Tau1N">
                  <div class="StepsSection_indicator__33uFT StepsSection_clickable__pOOdB StepsSection_active__IgggM">
                    <span class="StepsSection_step_number__F21qD">Step 1</span>
                  </div>
                  <div class="StepsSection_indicator__33uFT StepsSection_clickable__pOOdB">
                    <span class="StepsSection_step_number__F21qD">Step 2</span>
                  </div>
                  <div class="StepsSection_indicator__33uFT StepsSection_clickable__pOOdB">
                    <span class="StepsSection_step_number__F21qD">Step 3</span>
                  </div>
                </div>
                <div class="StepsSection_step_content__u_uFJ">
                  <div class="StepsSection_step_item__AciqY">
                    <div class="StepsSection_step_item_header__NNAHb">
                      <h3 class="StepsSection_title___6onm heading_5">Create</h3>
                      <p class="StepsSection_description__Vp_8r body">Generate professional surveys instantly with AI. Describe what you need in natural language.</p>
                    </div>
                  </div>
                  <div class="StepsSection_step_item__AciqY">
                    <div class="StepsSection_step_item_header__NNAHb">
                      <h3 class="StepsSection_title___6onm heading_5">Analyze</h3>
                      <p class="StepsSection_description__Vp_8r body">AI-powered analysis detects patterns, flags suspicious responses, and surfaces insights automatically.</p>
                    </div>
                  </div>
                  <div class="StepsSection_step_item__AciqY">
                    <div class="StepsSection_step_item_header__NNAHb">
                      <h3 class="StepsSection_title___6onm heading_5">Act</h3>
                      <p class="StepsSection_description__Vp_8r body">Take action on your findings. Export data, share reports, and integrate with your existing tools.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div class="TwoColumnFeatureLayout_container__q6gFH">
            <div class="TwoColumnFeatureLayout_features__gxveG">
              <div class="TwoColumnFeatureLayout_item__h_0jG">
                <div class="TwoColumnFeatureLayout_graphic__84NyX">
                  <div class="DataSection_graphic__r_FIJ"></div>
                </div>
                <h3 class="TwoColumnFeatureLayout_title__4dei6 heading_5">AI-Powered Question Generation</h3>
                <p class="TwoColumnFeatureLayout_description__LPtOd body_16">Define your research goals and let AI generate contextually relevant questions. Specify question types, branching logic, and validation rules.</p>
              </div>
              <div class="TwoColumnFeatureLayout_item__h_0jG">
                <div class="TwoColumnFeatureLayout_graphic__84NyX">
                  <div class="DataSection_graphic__r_FIJ"></div>
                </div>
                <h3 class="TwoColumnFeatureLayout_title__4dei6 heading_5">Ask AI About Your Data</h3>
                <p class="TwoColumnFeatureLayout_description__LPtOd body_16">Use our contextually aware engine to query your survey responses like a conversation.</p>
              </div>
            </div>
          </div>
          <section class="SolutionsSection_solutions__WCuKH">
            <div class="SolutionsSection_header__cUGx3">
              <h2 class="SolutionsSection_title__ISL5S heading_2">One platform, Endless solutions</h2>
              <p class="SolutionsSection_description__foWY3 body_16">Create surveys for any use case and watch insights instantly flow into your workspace.</p>
            </div>
            <div class="SolutionsSection_buttons_section__QBHFT">
              <div class="SolutionsSection_container__YNLeL">
                <ul class="SolutionsSection_solutions_list__C3vUr">
                  <li><button class="SolutionsSection_solutions_list__item__LGYB9 SolutionsSection_active__QnJ9n"><span class="SolutionsSection_item__title__Nv2rK">Research</span></button></li>
                  <li><button class="SolutionsSection_solutions_list__item__LGYB9"><span class="SolutionsSection_item__title__Nv2rK">Feedback</span></button></li>
                  <li><button class="SolutionsSection_solutions_list__item__LGYB9"><span class="SolutionsSection_item__title__Nv2rK">Analytics</span></button></li>
                  <li><button class="SolutionsSection_solutions_list__item__LGYB9"><span class="SolutionsSection_item__title__Nv2rK">Insights</span></button></li>
                  <li><button class="SolutionsSection_solutions_list__item__LGYB9"><span class="SolutionsSection_item__title__Nv2rK">Engagement</span></button></li>
                </ul>
              </div>
            </div>
            <div class="SolutionsSection_solutions_section__PZfju">
              <div class="SolutionsSection_video_container__e_SBc">
                <div class="SolutionsSection_video__Fs2o6"></div>
              </div>
            </div>
          </section>
        </div>
        <section>
          <div class="FeaturesSection_container__hnrOc">
            <div class="FeaturesSection_header__7cAHl">
              <h2 class="FeaturesSection_title__KjigU heading_2">Collaborative and connected</h2>
              <p class="FeaturesSection_subtitle__JR5GG body_16">Bring together scattered feedback into one collaborative space.</p>
            </div>
            <div class="FeaturesSection_features_row__GIYNT">
              <div class="FeaturesSection_card__oJdL0">
                <div class="FeaturesSection_feature_content__MomwN">
                  <div class="FeaturesSection_feature_header__OkPdN">
                    <h3 class="FeaturesSection_feature_title__Xb2IM heading_5">Connect data seamlessly</h3>
                    <p class="FeaturesSection_feature_description__YINpX body">Import responses from existing surveys, CRMs, or APIs to unify sources into one centralized space.</p>
                  </div>
                </div>
              </div>
              <div class="FeaturesSection_card__oJdL0">
                <div class="FeaturesSection_feature_content__MomwN">
                  <div class="FeaturesSection_feature_header__OkPdN">
                    <h3 class="FeaturesSection_feature_title__Xb2IM heading_5">Detect bad responses</h3>
                    <p class="FeaturesSection_feature_description__YINpX body">AI flags suspicious patterns, bot responses, and inconsistent answers automatically.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="FeaturesSection_features_row__GIYNT">
              <div class="FeaturesSection_card__oJdL0">
                <div class="FeaturesSection_feature_content__MomwN">
                  <div class="FeaturesSection_feature_header__OkPdN">
                    <h3 class="FeaturesSection_feature_title__Xb2IM heading_5">Integrates with tools you trust</h3>
                    <p class="FeaturesSection_feature_description__YINpX body">Connect with Sheets, Notion, Slack, and your existing research stack.</p>
                  </div>
                </div>
              </div>
              <div class="FeaturesSection_card__oJdL0">
                <div class="FeaturesSection_feature_content__MomwN">
                  <div class="FeaturesSection_feature_header__OkPdN">
                    <h3 class="FeaturesSection_feature_title__Xb2IM heading_5">Collaborate together</h3>
                    <p class="FeaturesSection_feature_description__YINpX body">Work with your team in real time to design surveys, review responses, and share insights.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="SecuritySection_section__dbHHJ">
          <div class="SecuritySection_container__DQLVK">
            <div class="SecuritySection_card__2leue">
              <div class="SecuritySection_content__riStQ">
                <h2 class="SecuritySection_title__oeX23 heading_2">Enterprise-grade security</h2>
                <p class="SecuritySection_description__nYg2Y body_16">We push the frontier without compromising trust, prioritizing compliance with the highest industry standards.</p>
              </div>
              <div class="SecuritySection_features__XXBaj">
                <div class="SecuritySection_feature__LLcyC">
                  <div class="SecuritySection_icon__XDnXu">
                    <svg width="32" height="36" viewBox="0 0 32 36" fill="none" class="icon">
                      <path d="M11.4211 16.4345L14.0288 19.0422L20.1133 12.9576M1.42505 1.65771H30.1094V25.9959L15.7672 33.8189L1.42505 25.9959V1.65771Z" stroke="var(--color-black)" stroke-width="2.60767" stroke-linecap="square"></path>
                    </svg>
                  </div>
                  <h3 class="SecuritySection_title__oeX23 heading_5">SOC2 I</h3>
                </div>
                <div class="SecuritySection_feature__LLcyC">
                  <div class="SecuritySection_icon__XDnXu">
                    <svg width="32" height="36" viewBox="0 0 32 36" fill="none" class="icon">
                      <path d="M11.4211 16.4345L14.0288 19.0422L20.1133 12.9576M1.42505 1.65771H30.1094V25.9959L15.7672 33.8189L1.42505 25.9959V1.65771Z" stroke="var(--color-black)" stroke-width="2.60767" stroke-linecap="square"></path>
                    </svg>
                  </div>
                  <h3 class="SecuritySection_title__oeX23 heading_5">SOC2 II</h3>
                </div>
                <div class="SecuritySection_feature__LLcyC">
                  <div class="SecuritySection_icon__XDnXu">
                    <svg width="29" height="36" viewBox="0 0 29 36" fill="none" class="icon">
                      <path d="M17.9577 18.5711L19.8278 20.4412L11.5836 28.6854L9.71351 26.8153L17.9577 18.5711Z" fill="var(--color-black)"></path>
                      <path d="M11.5827 18.5711L9.71256 20.4412L17.9567 28.6854L19.8269 26.8153L11.5827 18.5711Z" fill="var(--color-black)"></path>
                      <path d="M16.6218 0.34668L17.0095 0.733398L28.322 12.0459L28.7087 12.4336V35.1885H0.828857V0.34668H16.6218ZM3.47339 32.5439H26.0642V14.3037H14.7517V2.99121H3.47339V32.5439ZM17.3962 11.6592H24.1951L17.3962 4.86035V11.6592Z" fill="var(--color-black)"></path>
                    </svg>
                  </div>
                  <h3 class="SecuritySection_title__oeX23 heading_5">No training on user data</h3>
                </div>
                <div class="SecuritySection_feature__LLcyC">
                  <div class="SecuritySection_icon__XDnXu">
                    <svg width="30" height="36" viewBox="0 0 30 36" fill="none" class="icon">
                      <path d="M3.05854 15.6031V1.72461H16.937L28.2133 13.0009V33.8186H17.8044M16.937 2.59908V13.0009H27.3526M1.32373 26.0119H12.6V33.8186H1.32373V26.0119ZM10.8652 26.0119V24.7108C10.8652 22.5551 9.1176 20.8075 6.96186 20.8075C4.80612 20.8075 3.05854 22.5551 3.05854 24.7108V26.0119H10.8652Z" stroke="var(--color-black)" stroke-width="2.63992" stroke-linecap="square"></path>
                    </svg>
                  </div>
                  <h3 class="SecuritySection_title__oeX23 heading_5">Audited and tested</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="Footer_wrapper__iU9LJ Footer_dark__wAppw">
          <div class="Footer_container__Urhys">
            <div class="Footer_top__W2M2k">
              <div class="Footer_logo_container__p4Fbw">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5273 1.88794C19.9293 1.88794 20.2557 2.21354 20.2559 2.61548V16.3694C20.2557 16.5599 20.1804 16.7431 20.0469 16.8792L15.6992 21.3098C15.5624 21.4492 15.375 21.5275 15.1797 21.5276H1.68945C1.28741 21.5276 0.961055 21.2021 0.960938 20.8V7.15454C0.961003 6.96399 1.03553 6.78083 1.16895 6.64478L5.62402 2.10571C5.76092 1.96636 5.9482 1.88794 6.14355 1.88794H19.5273ZM6.40137 7.03247C6.20054 7.03264 6.03823 7.19589 6.03809 7.39673V16.0208C6.03809 16.2217 6.20045 16.3848 6.40137 16.385H14.8145C15.0155 16.385 15.1787 16.2218 15.1787 16.0208V7.39673C15.1786 7.19579 15.0154 7.03247 14.8145 7.03247H6.40137Z" fill="var(--color-white-absolute)"></path>
                </svg>
              </div>
              <div class="Footer_description_container__WWLlH">
                <span class="Footer_title__CKLXX heading_2">Enter a new age of survey research</span>
                <div class="Footer_ctaContainer__V70Jc">
                  <span class="body Footer_subtitle__TiKWQ">Surbee is an AI-first workspace that enables fast, accurate survey research.</span>
                  <a href="/book-demo">
                    <button class="Button_button__8B4nB body Footer_cta__e8pbn dark filled Button_withArrow__tTKwT">
                      <span>Book a Demo</span>
                    </button>
                  </a>
                </div>
              </div>
            </div>
            <nav class="Footer_nav__CRRxT Footer_nav_main__BmxnH">
              <ul class="Footer_nav_list__ydeyE">
                <li class="body Footer_nav_item__As8uO"><a href="/templates">Templates</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="/pricing">Pricing</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="/careers">Careers</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="/blog">Blog</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="/changelog">Changelog</a></li>
              </ul>
              <ul class="Footer_nav_list__ydeyE">
                <li class="body Footer_nav_item__As8uO"><a href="#">Research</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Feedback</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Analytics</a></li>
              </ul>
              <ul class="Footer_nav_list__ydeyE">
                <li class="body Footer_nav_item__As8uO"><a href="#">Help Center</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">API Docs</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Community</a></li>
              </ul>
              <ul class="Footer_nav_list__ydeyE">
                <li class="body Footer_nav_item__As8uO"><a href="#">Twitter</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">LinkedIn</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Discord</a></li>
              </ul>
              <ul class="Footer_nav_list__ydeyE">
                <li class="body Footer_nav_item__As8uO"><a href="/privacy">Privacy</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="/terms">Terms</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Security</a></li>
                <li class="body Footer_nav_item__As8uO"><a href="#">Cookies</a></li>
              </ul>
            </nav>
            <nav class="Footer_nav__CRRxT Footer_nav_legal__JKezi">
              <div class="Footer_nav_list__ydeyE Footer_nav_list_span_two__xad7e Footer_nav_item_copyright__ZHlXO body">
                © 2024 Surbee, Inc. All rights reserved.
              </div>
            </nav>
          </div>
        </footer>
      </div>
        `,
      }}
    />
  );
}
