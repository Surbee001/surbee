// ------------------ Split ------------------ //

function runSplit() {
  text = new SplitType("[animation=loading-split]", {
    types: "lines",
    lineClass: "line-animation-split",
  });

  textheading = new SplitType("[animation=load--heading]", {
    types: "lines",
    lineClass: "animation-heading-split",
  });

  textquotes = new SplitType("[animation=quote-fade]", {
    types: "words",
    wordClass: "quote-fade-split",
  });

  // Wrap each line in a div with class 'overflow-hidden'
  $(".line-animation-split").each(function () {
    $(this).wrap("<div class='overflow-hidden'></div>");
  });
}

runSplit();

// Update on window resize
let windowWidth = $(window).innerWidth();
window.addEventListener("resize", function () {
  if (windowWidth !== $(window).innerWidth()) {
    windowWidth = $(window).innerWidth();
    text.revert();
    textfade.revert();
    textheading.revert();
    textquotes.revert();
    runSplit();
  }
});

// ------------------ gsap ------------------ //

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ------------------ smooth ease ------------------ //

CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
CustomEase.create("fastToSlow", "M0,0 C0.3,0 0.7,1 1,1");

// ------------------ loading screen ------------------ //
// ------------------- Shared Helper: Play Lottie ------------------- //
function playLottie(container) {
  return new Promise((resolve) => {
    const anim = lottie.loadAnimation({
      container: container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ee85cc2339c06a827f42c0_Lottie%2006%20Loading.json",
    });
    anim.addEventListener("complete", resolve);
  });
}

// ------------------- Shared Helper: Add Main Animations ------------------- //
function addMainAnimationsToTimeline(tl) {
  tl.add("loadingAnimationsStart");

  if (document.querySelectorAll(".line-animation-split").length > 0) {
    tl.from(
      ".line-animation-split",
      {
        y: "100%",
        opacity: 0,
        stagger: { each: 0.05, from: "start" },
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    );
  }

  if (document.querySelector(".highlight--hero.is--1")) {
    tl.from(
      ".highlight--hero.is--1",
      {
        y: "100%",
        opacity: 0,
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    ).from(".highlight--hero.is--1", {
      width: window.innerWidth > 992 ? "310rem" : "173rem",
      duration: 0.6,
      ease: "smooth",
    });
  }

  if (document.querySelector(".highlight--hero.is--2")) {
    tl.from(
      ".highlight--hero.is--2",
      {
        width: "0rem",
        duration: 0.6,
        ease: "smooth",
      },
      "-=0.2"
    );
  }

  if (document.querySelectorAll("[animation=loading]").length > 0) {
    tl.from(
      "[animation=loading]",
      {
        y: "20rem",
        opacity: 0,
        stagger: { each: 0.1, from: "start" },
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    );
  }

  const hero1Lines = document.querySelectorAll(
    ".container--1376.is--hero.is--1 .hero--line, .svg--404.is--right path, .container--1376.is--hero.is--1 .hero--line-blue"
  );
  if (hero1Lines.length > 0) {
    tl.from(
      hero1Lines,
      {
        opacity: 0,
        stagger: { each: 0.02, from: "start" },
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    );
  }

  const hero2Lines = document.querySelectorAll(
    ".container--1376.is--hero.is--end .hero--line, .svg--404.is--left path, .container--1376.is--hero.is--end .hero--line-blue"
  );
  if (hero2Lines.length > 0) {
    tl.from(
      hero2Lines,
      {
        opacity: 0,
        stagger: { each: 0.02, from: "end" },
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    );
  }

  if (document.querySelector(".line--wrapper-hero")) {
    tl.from(
      ".line--wrapper-hero",
      {
        width: 0,
        ease: "smooth",
        duration: 0.6,
      },
      2
    );
  }

  if (document.querySelector(".line--wrapper-hero .hero--line")) {
    tl.from(
      ".line--wrapper-hero .hero--line",
      {
        rotate: 0,
        ease: "smooth",
        duration: 0.6,
      },
      2
    );
  }

  if (document.querySelectorAll("[animation=loading-reverse]").length > 0) {
    tl.from(
      "[animation=loading-reverse]",
      {
        y: "-60rem",
        opacity: 0,
        stagger: { each: 0.1, from: "start" },
        ease: "smooth",
        duration: 0.6,
      },
      "loadingAnimationsStart"
    );
  }
}

// ------------------- Global Page Load ------------------- //
async function pageLoad() {
  const lottieContainer = document.querySelector(".lottie--load");
  const tl = gsap.timeline({ paused: true });

  if (document.querySelector(".main-wrapper")) {
    tl.to(".main-wrapper", {
      opacity: 1,
      ease: "smooth",
      duration: 0.6,
    });
  }

  if (lottieContainer) await playLottie(lottieContainer);

  if (lottieContainer) {
    tl.to(
      ".lottie--load",
      {
        y: "-20rem",
        opacity: 0,
        duration: 0.6,
        ease: "smooth",
      },
      "+=0.1"
    );
  }

  if (document.querySelector(".loading--screen")) {
    tl.to(
      ".loading--screen",
      {
        y: "-100vh",
        duration: 0.6,
        ease: "smooth",
        onComplete: () => {
          document.querySelector(".loading--screen").style.display = "none";
        },
      },
      "<"
    );
  }

  addMainAnimationsToTimeline(tl);
  tl.play();
}

// ------------------- Delay Execution ------------------- //
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (!window.disableGlobalPageLoad) {
      pageLoad();
    }
  }, 0);
});
// ------------------ scroll trigger ------------------ //
document.querySelectorAll(".line-split-fade").forEach(function (fadeSplitElem) {
  gsap.from(fadeSplitElem.querySelectorAll(".char-split-fade"), {
    scrollTrigger: {
      trigger: fadeSplitElem,
      start: "bottom bottom",
      markers: false,
    },
    y: "100%",
    opacity: "0",
    stagger: { each: 0.05, from: "start" },
    ease: "smooth",
    duration: 0.6,
  });
});

document.querySelectorAll("[animation=fade]").forEach(function (fadeSplitElem) {
  gsap.from(fadeSplitElem, {
    scrollTrigger: {
      trigger: fadeSplitElem,
      start: "top bottom-=50",
      markers: false,
    },
    y: "20rem",
    opacity: 0,
    ease: "smooth",
    duration: 0.6,
  });
});

document
  .querySelectorAll("[animation=fade-stagger]")
  .forEach(function (fadeSplitElem) {
    gsap.from(fadeSplitElem.querySelectorAll("[animation=fade-item]"), {
      scrollTrigger: {
        trigger: fadeSplitElem,
        start: "top bottom-=200",
        markers: false,
      },
      y: "40rem",
      opacity: 0,
      ease: "smooth",
      duration: 0.6,
      stagger: {
        each: 0.1,
      },
    });
  });

document
  .querySelectorAll(".workflow--column:nth-child(1)")
  .forEach(function (element) {
    gsap.fromTo(
      element,
      { y: "-80rem" }, // Starting position
      {
        y: "40rem", // Ending position
        ease: "smooth", // Smooth easing
        scrollTrigger: {
          trigger: ".is--workflows-hero",
          start: "top bottom",
          end: "bottom top",
          markers: false,
          scrub: true,
        },
      }
    );
  });

document
  .querySelectorAll(".workflow--column:nth-child(2)")
  .forEach(function (element) {
    gsap.fromTo(
      element,
      { y: "40rem" }, // Starting position
      {
        y: "-80rem", // Ending position
        ease: "smooth", // Smooth easing
        scrollTrigger: {
          trigger: ".is--workflows-hero",
          start: "top bottom",
          end: "bottom top",
          markers: false,
          scrub: true,
        },
      }
    );
  });

document
  .querySelectorAll(".workflow--column:nth-child(4)")
  .forEach(function (element) {
    gsap.fromTo(
      element,
      { y: "-100rem" }, // Starting position
      {
        y: "40rem", // Ending position
        ease: "smooth", // Smooth easing
        scrollTrigger: {
          trigger: ".is--workflows-hero",
          start: "top bottom",
          end: "bottom top",
          markers: false,
          scrub: true,
        },
      }
    );
  });

document
  .querySelectorAll("[animation=quote-fade]")
  .forEach(function (fadeSplitElem) {
    gsap.from(fadeSplitElem.querySelectorAll(".quote-fade-split"), {
      scrollTrigger: {
        trigger: fadeSplitElem,
        start: "top center+=100",
        end: "bottom center+=100",
        markers: false,
        scrub: true,
      },
      opacity: "0",
      stagger: {
        each: 0.05,
      },
    });
  });

// ------------------ Menu -------------------- //

let isMenuOpen = false; // Track if the menu is open

document.querySelector(".menu--trigger").addEventListener("click", function () {
  let tl = gsap.timeline();

  if (!isMenuOpen) {
    // Set initial styles for opening
    gsap.set(".navbar--menu", {
      display: "flex",
      height: "0vh",
    });
    gsap.set(".menu--trigger-text", { y: "0rem" });
    gsap.set(".navbar--link-parent", { y: "20rem", opacity: 0 });
    gsap.set(".btn--nav-wrapper", {
      y: "20rem",
      opacity: 0,
    });
    gsap.set(".navbar--menu-privacy", {
      y: "20rem",
      opacity: 0,
    });

    // Add animations to the timeline for opening
    tl.to(".navbar--menu", { height: "auto", duration: 0.6, ease: "smooth" }, 0)
      .to(
        ".menu--trigger-text",
        { top: "-1.1em", duration: 0.6, ease: "smooth" },
        0
      )
      .to(
        ".navbar--link-parent",
        {
          y: "0rem",
          opacity: 1,
          duration: 0.6,
          stagger: {
            each: 0.05,
          },
          ease: "smooth",
        },
        0.3 // This starts the stagger slightly after the initial animations
      )
      .to(
        ".btn--nav-wrapper",
        {
          y: "0rem",
          opacity: 1,
          duration: 0.6,
          ease: "smooth",
        },
        0.7 // This starts the stagger slightly after the initial animations
      )
      .to(
        ".navbar--menu-privacy",
        {
          y: "0rem",
          opacity: 1,
          duration: 0.6,
          ease: "smooth",
        },
        0.75 // This starts the stagger slightly after the initial animations
      );

    // Disable scrolling
    document.body.style.overflow = "hidden";

    isMenuOpen = true;
  } else {
    // Reverse the animations for closing
    tl.to(".navbar--menu", { height: "0vh", duration: 0.4, ease: "smooth" }, 0)
      .to(
        ".menu--trigger-text",
        { top: "0rem", duration: 0.4, ease: "smooth" },
        0
      )
      .to(
        ".navbar--link-parent",
        { y: "20rem", opacity: 0, duration: 0.4, ease: "smooth" },
        0
      )
      .to(
        ".btn--nav-wrapper",
        {
          y: "20rem",
          opacity: 0,
          duration: 0.4,
          ease: "smooth",
        },
        0 // This starts the stagger slightly after the initial animations
      )
      .to(
        ".navbar--menu-privacy",
        {
          y: "20rem",
          opacity: 0,
          duration: 0.4,
          ease: "smooth",
        },
        0 // This starts the stagger slightly after the initial animations
      )

      .then(() => {
        gsap.set(".navbar--menu", { display: "none" }); // Hide the menu after animation
        document.body.style.overflow = ""; // Enable scrolling
      });

    isMenuOpen = false;
  }
});

// ------------------ navbar dropdown------------------ //

document.querySelectorAll(".navbar--dropdown").forEach((dropdown) => {
  const trigger = dropdown.querySelector(".navbar--dropdown-trigger");
  const response = dropdown.querySelector(".navbar--dropdown-response");
  const arrow = dropdown.querySelector(".navbar--arrow");
  let animationDuration = 200; // in ms

  dropdown.addEventListener("mouseenter", () => {
    // Expand dropdown
    response.style.height = "auto";
    let autoHeight = response.offsetHeight + "px";
    response.style.height = "0px";
    response.style.overflow = "hidden";
    response.style.transition = `height ${animationDuration}ms ease-in-out`;

    requestAnimationFrame(() => {
      response.style.height = autoHeight;
    });

    // Rotate arrow with GSAP
    gsap.to(arrow, {
      rotate: 180,
      duration: animationDuration / 1000,
      ease: "power2.out",
    });
  });

  dropdown.addEventListener("mouseleave", () => {
    // Collapse dropdown
    response.style.height = response.offsetHeight + "px";
    requestAnimationFrame(() => {
      response.style.height = "0px";
    });

    setTimeout(() => {
      response.style.height = "";
    }, animationDuration);

    // Reset arrow rotation
    gsap.to(arrow, {
      rotate: 0,
      duration: animationDuration / 1000,
      ease: "power2.in",
    });
  });
});

// ------------------ book a demo popup ------------------ //

document.addEventListener("DOMContentLoaded", () => {
  const openTrigger = document.querySelectorAll('[animation="bookademo"]');
  const closeTrigger = document.querySelector(".popup--close-trigger");
  const popup = document.querySelector(".bookademo--popup");
  const elements = document.querySelectorAll('[animation="bookademo-element"]');
  const bookbg = document.querySelector(".bookademobg");
  const body = document.body;
  const announcementBar = document.querySelector(".dj-announcement--bar");
  const nav = document.querySelector(".navbar");

  function openPopup() {
    body.classList.add("noscroll");
    closeTrigger.classList.add("is--eventnone");

    gsap.set(popup, { display: "flex" });
    gsap.set(elements, { opacity: 0, y: "-40rem" });

    gsap
      .timeline()
      .to(popup, { height: "calc(100vh - 80rem)", duration: 1, ease: "smooth" })
      .to(bookbg, { opacity: 1, duration: 1, ease: "smooth" }, 0)
      .to(nav, { top: "calc(100vh - 80rem)", duration: 1, ease: "smooth" }, 0)
      .to(announcementBar, { height: 0, duration: 0.8, ease: "smooth" }, 0)
      .fromTo(
        elements,
        { opacity: 0, y: "-40rem" },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "smooth" },
        0
      );
  }

  function closePopup() {
    const tl = gsap.timeline();

    tl.to(elements, {
      opacity: 0,
      y: "-40rem",
      stagger: 0.1,
      duration: 1,
      ease: "smooth",
    })
      .to(popup, { height: "0", duration: 1, ease: "smooth" }, "0")
      .to(bookbg, { opacity: 0, duration: 1, ease: "smooth" }, "0")
      .to(nav, { top: 0, duration: 1, ease: "smooth" }, "0")
      .to(
        announcementBar,
        { height: "auto", duration: 0.8, ease: "smooth" },
        "0"
      )
      .set(popup, { display: "none" })
      .call(() => {
        body.classList.remove("noscroll");
        closeTrigger.classList.remove("is--eventnone");
      });
  }

  openTrigger.forEach((trigger) =>
    trigger.addEventListener("click", openPopup)
  );
  closeTrigger.addEventListener("click", closePopup);
});

// ------------------ slider ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  let swiper = new Swiper(".is--peoplesay-slider", {
    loop: false,
    slidesPerView: 1,
    spaceBetween: "24rem",
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    mousewheel: {
      forceToAxis: true,
      sensitivity: 1,
    },
    breakpoints: {
      992: {
        slidesPerView: 3,
        spaceBetween: "24rem",
      },
    },
  });
});

// ------------------ change year dynamically ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// ------------------ typing animation ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  const target = document.querySelector(".search--animation div");
  const phrases = [
    "Distributor not to provide more favorable pricing",
    "Settlement agreement over employees overtime pay",
    "Converting an S Corp to a C Corp, particularly involving an LLC",
  ];
  const images = document.querySelectorAll(
    ".img--100.is--knowledgesearch-bg.is--absolute"
  );

  let phraseIndex = 0;
  let index = 0;
  let typing = false;

  const typingSpeed = 25;
  const pauseBeforeFadeOut = 2000;
  const pauseBeforeFadeIn = 500;
  const fadeDuration = 500;

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "|";
  target.innerHTML = "";
  target.appendChild(cursor);

  function fadeInImage(i) {
    images.forEach((img, idx) => {
      img.style.transition = "opacity 1s ease";
      img.style.opacity = idx === i ? "1" : "0";
    });
  }

  function typeCharacter() {
    if (index < phrases[phraseIndex].length) {
      cursor.insertAdjacentText("beforebegin", phrases[phraseIndex][index]);
      index++;
      setTimeout(typeCharacter, typingSpeed);
    } else {
      fadeInImage(phraseIndex);
      setTimeout(() => {
        requestAnimationFrame(() => {
          target.classList.add("fade-out");
          fadeInImage(-1);
          setTimeout(() => {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            index = 0;
            target.classList.remove("fade-out");
            target.innerHTML = "";
            target.appendChild(cursor);
            setTimeout(typeCharacter, pauseBeforeFadeIn);
          }, fadeDuration);
        });
      }, pauseBeforeFadeOut);
    }
  }

  function startTypingLoop() {
    if (!typing) {
      typing = true;
      typeCharacter();
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTypingLoop();
        }
      });
    },
    { threshold: 0.8 }
  );

  observer.observe(target);

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    .cursor {
      display: inline-block;
      font-weight: bold;
      animation: blink 0.5s infinite alternate;
    }
    @keyframes blink {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
    .img--100.is--knowledgesearch-bg {
      opacity: 0;
      transition: opacity 1s ease;
    }
    .search--animation div {
      opacity: 1;
      transition: opacity 1s ease;
    }
    .search--animation .fade-out {
      opacity: 0 !important;
    }
  `;
  document.head.appendChild(style);
});

// ------------------ typing animation home ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  const textContainer = document.querySelector(".search--animation-search div");
  const textPhrases = [
    "Have we done a deal like this before?",
    "Are any of our clients' documents impacted by this new regulation?",
    "What past cases are most similar to this one?",
    "Where have we negotiated a clause like this before?",
    "Who is an expert on this at the London office?",
    "What are the open issues with this client?",
  ];

  let phraseIndex = 0;
  const typingSpeed = 25;
  const pauseBeforeFadeOut = 1000;
  const pauseBeforeNextPhrase = 1000;
  const fadeDuration = 1000;

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "|";

  function startTypingAnimation() {
    textContainer.innerHTML = "";
    textContainer.style.opacity = "1"; // reset opacity
    textContainer.appendChild(cursor);

    let charIndex = 0;
    const currentPhrase = textPhrases[phraseIndex];

    function typeCharacter() {
      if (charIndex < currentPhrase.length) {
        cursor.insertAdjacentText("beforebegin", currentPhrase[charIndex]);
        charIndex++;
        setTimeout(typeCharacter, typingSpeed);
      } else {
        setTimeout(() => {
          textContainer.classList.add("fade-out");
          setTimeout(() => {
            phraseIndex = (phraseIndex + 1) % textPhrases.length;
            textContainer.classList.remove("fade-out");
            startTypingAnimation();
          }, fadeDuration);
        }, pauseBeforeFadeOut);
      }
    }

    typeCharacter();
  }

  // Trigger animation when in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTypingAnimation();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.8 }
  );

  observer.observe(textContainer);

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    .cursor {
      display: inline-block;
      font-weight: bold;
      animation: blink 0.5s infinite alternate;
    }

    @keyframes blink {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }

    .fade-out {
      opacity: 0 !important;
      transition: opacity 1s ease;
    }

    .search--animation-search div {
      transition: opacity 1s ease;
    }
  `;
  document.head.appendChild(style);
});

// ------------------ lottie on hover ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  const wrappers = document.querySelectorAll(".hero--line-hover-wrapper");
  const lottieFiles = [
    "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ed4451ee601a3195844e1f_Lottie_01_Rectangle.json",
    "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ed4428de5b8e48c0b41f66_Lottie_02_Rectangle.json",
    "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ed44593cfb34d52b45641a_Lottie%20Rectangle%20v02.json",
  ];

  const isMobile = window.matchMedia("(max-width: 991px)").matches;

  function getLottieWidth() {
    return isMobile ? "144rem" : "168rem";
  }

  const animations = [];

  wrappers.forEach((wrapper, index) => {
    const lottieContainer = wrapper.querySelector(".lottie--home");
    if (!lottieContainer) return;

    const lottieAnimation = lottie.loadAnimation({
      container: lottieContainer,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: lottieFiles[index],
    });

    gsap.set(lottieContainer, { width: 0, overflow: "hidden" });

    lottieAnimation.addEventListener("DOMLoaded", function () {
      const svgElement = lottieContainer.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("preserveAspectRatio", "xMinYMid slice");
      }
    });

    animations.push({ container: lottieContainer, animation: lottieAnimation });

    if (!isMobile) {
      const parent = wrapper.closest(".hero--line-wrapper.is--title");
      if (!parent) return;

      parent.addEventListener("mouseenter", () => {
        gsap.to(lottieContainer, {
          width: getLottieWidth(),
          duration: 0.3,
          ease: "smooth",
          onComplete: () => {
            lottieAnimation.loop = true;
            lottieAnimation.play();
          },
        });
      });

      parent.addEventListener("mouseleave", () => {
        gsap.to(lottieContainer, {
          width: 0,
          duration: 0.3,
          ease: "smooth",
          onComplete: () => {
            lottieAnimation.stop();
            lottieAnimation.goToAndStop(0, true);
          },
        });
      });
    }
  });

  // 👉 Mobile: autoplay through Lotties
  if (isMobile && animations.length > 0) {
    let current = 0;

    function showNextLottie() {
      const { container, animation } = animations[current];

      // Reset the animation frame
      animation.stop();
      animation.goToAndStop(0, true);

      gsap.to(container, {
        width: getLottieWidth(),
        duration: 0.3,
        ease: "smooth",
        onComplete: () => {
          animation.loop = false;
          animation.play();

          const onCompleteHandler = () => {
            animation.removeEventListener("complete", onCompleteHandler);

            gsap.to(container, {
              width: 0,
              duration: 0.3,
              ease: "smooth",
              onComplete: () => {
                current = (current + 1) % animations.length;
                setTimeout(showNextLottie, 300); // Continue looping after short delay
              },
            });
          };

          animation.addEventListener("complete", onCompleteHandler);
        },
      });
    }

    setTimeout(showNextLottie, 3000); // ⏳ Initial delay before the first Lottie
  }
});

// ------------------ Hover bg buttons ------------------ //

function applyHoverEffect() {
  document
    .querySelectorAll(".btn--nav, .btn, .btn--book")
    .forEach((element) => {
      const hoverBg = element.querySelector(".hover--bg");

      if (!hoverBg) return; // guard against missing hover background

      element.addEventListener("mouseenter", (event) => {
        const { top, bottom } = element.getBoundingClientRect();
        const mousePosition = event.clientY;

        if (mousePosition < (top + bottom) / 2) {
          // Mouse enters from the top
          hoverBg.style.top = "0";
          hoverBg.style.bottom = "auto";
          hoverBg.style.height = "0";
          requestAnimationFrame(() => {
            hoverBg.style.transition = "height 0.2s ease, top 0.2s ease";
            hoverBg.style.height = "100%";
          });
        } else {
          // Mouse enters from the bottom
          hoverBg.style.top = "auto";
          hoverBg.style.bottom = "0";
          hoverBg.style.height = "0";
          requestAnimationFrame(() => {
            hoverBg.style.transition = "height 0.2s ease, bottom 0.2s ease";
            hoverBg.style.height = "100%";
          });
        }
      });

      element.addEventListener("mouseleave", (event) => {
        const { top, bottom } = element.getBoundingClientRect();
        const mousePosition = event.clientY;

        if (mousePosition < (top + bottom) / 2) {
          // Mouse leaves from the top
          hoverBg.style.top = "0";
          hoverBg.style.bottom = "auto";
          hoverBg.style.transition = "height 0.2s ease, top 0.2s ease";
          hoverBg.style.height = "0";
        } else {
          // Mouse leaves from the bottom
          hoverBg.style.top = "auto";
          hoverBg.style.bottom = "0";
          hoverBg.style.transition = "height 0.2s ease, bottom 0.2s ease";
          hoverBg.style.height = "0";
        }
      });
    });
}

// Run on initial load
applyHoverEffect();
// ------------------ reload on resize ------------------ //

let resizeTimer;
let prevWidth = window.innerWidth;
const breakpoints = [992, 768, 480];

window.addEventListener("resize", function () {
  const currentWidth = window.innerWidth;

  // Check if currentWidth crosses any breakpoints and if it's different from prevWidth
  if (
    breakpoints.some(
      (bp) =>
        (currentWidth < bp && prevWidth >= bp) ||
        (currentWidth >= bp && prevWidth < bp)
    )
  ) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      location.reload();
    }, 300);
  }

  prevWidth = currentWidth; // Update previous width after checking
});

// ------------------ products load ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  // Start Lottie 1 after 2s
  setTimeout(() => {
    const lottie1Container = document.querySelector(".lottie-home-1");

    const lottie1 = lottie.loadAnimation({
      container: lottie1Container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ed4475ee601a3195846815_Lottie%20Card%20Version%2002.json",
    });

    // When Lottie 1 finishes
    lottie1.addEventListener("complete", () => {
      // Fade out on mobile
      if (window.innerWidth < 992) {
        lottie1Container.style.transition = "opacity 0.5s ease";
        lottie1Container.style.opacity = "0";
      }

      // Then load Lottie 2
      const lottie2Container = document.querySelector(".lottie-home-2");
      lottie2Container.style.opacity = "1"; // Fade in Lottie 2

      const lottie2 = lottie.loadAnimation({
        container: lottie2Container,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67ed448beeb3b5fb2b7f8605_Lottie%20Cards%20Version%2002.json",
      });

      // Fade out Lottie 2 after it completes on mobile
      lottie2.addEventListener("complete", () => {
        if (window.innerWidth < 992) {
          lottie2Container.style.transition = "opacity 0.5s ease";
          lottie2Container.style.opacity = "0";
        }
      });
    });
  }, 2000); // Initial 2s delay
});

// ------------------ footer links ------------------ //

document.querySelectorAll(".footer--link").forEach((link) => {
  const line = link.querySelector(".footerlink-line");

  link.addEventListener("mouseenter", () => {
    gsap.fromTo(
      line,
      { x: "-100%" },
      { x: "0%", duration: 0.3, ease: "power2.out" }
    );
  });

  link.addEventListener("mouseleave", () => {
    gsap.to(line, { x: "100%", duration: 0.3, ease: "power2.in" });
  });
});

// ------------------ hubspot when not loading ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  const formTimeout = 1000; // Faster fallback: 2 seconds instead of 4

  // Check for form containers
  const allScripts = Array.from(document.querySelectorAll("script"));
  const creationScripts = allScripts.filter((script) =>
    script.innerText.includes("hbspt.forms.create")
  );

  // For each detected script that calls hbspt.forms.create
  creationScripts.forEach((script, index) => {
    const container = script.parentElement;

    setTimeout(() => {
      // Check if this container has a form inside
      const formInside = container.querySelector(".hbspt-form");
      if (!formInside) {
        // Inject fallback directly under the current form container
        const fallback = document.createElement("div");
        fallback.className = "hubspot--notshowing";
        fallback.style.display = "flex";
        fallback.innerHTML = `
            <p>It seems the form didn’t load. Please check your privacy settings or use a different browser.</p>
          `;
        container.appendChild(fallback);
      }
    }, formTimeout);
  });
});
