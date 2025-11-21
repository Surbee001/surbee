gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, CustomEase);

// Optional: easing setup
CustomEase.create("fastToSlow", "M0,0 C0.3,0 0.7,1 1,1");

// ------------------- loading animations ------------------ //
// Disable global script.js animation
window.disableGlobalPageLoad = true;

// ------------------- Home Page Load ------------------- //
async function pageLoad() {
  document.body.style.overflow = "hidden";

  const lottieContainer = document.querySelector(".lottie--load");
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      document.body.style.overflow = "";
    },
  });

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

  // Use the shared animation helper
  addMainAnimationsToTimeline(tl);

  tl.play();
}

pageLoad();

// ------------------ scroll animations ------------------ //
ScrollTrigger.matchMedia({
  "(min-width: 993px)": function () {
    // Initial states
    gsap.set(".home--collective-dot.is--0", {
      width: "136rem",
      height: "130rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      x: "441rem",
      y: "0rem",
    });

    gsap.set(".home--collective-dot.is--1", {
      width: "222rem",
      height: "130rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "-460rem",
    });

    gsap.set(".home--collective-dot.is--2", {
      width: "71rem",
      height: "40rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "-464rem",
      x: "368rem",
    });

    gsap.set(".home--collective-dot.is--3", {
      width: "136rem",
      height: "80rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "-360rem",
      x: "470rem",
    });

    gsap.set(".home--collective-dot.is--4", {
      width: "136rem",
      height: "198rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "-161rem",
      x: "-492rem",
    });

    gsap.set(".home--collective-dot.is--5", {
      width: "190rem",
      height: "40rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "-400rem",
      x: "-500rem",
    });

    gsap.set(".home--collective-dot.is--6", {
      width: "62rem",
      height: "40rem",
      boxShadow: "0 0 0 1rem #DCDAD7",
      backgroundColor: "#f4f2ef",
      borderRadius: "7rem",
      y: "100rem",
      x: "-300rem",
    });

    gsap.set(".home--searchtext", {
      opacity: 0,
    });

    gsap.set(".container--725.is--search", {
      opacity: 0,
      y: "-20rem",
    });

    gsap.set(".home--collective-dot-inner", {
      opacity: 0,
    });

    // First scroll timeline
    const tlcollective = gsap.timeline({
      scrollTrigger: {
        trigger: ".home--collective-first-trigger",
        start: "top center",
        end: "bottom center",
        scrub: true,
        markers: false,
      },
    });

    const tlcollective2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".home--collective-first-trigger",
        start: "top center",
        end: "top center-=100",
        scrub: true,
        markers: false,
      },
    });

    // Fade out the intro element
    tlcollective2.to(".home--collective-start", { opacity: 0 }, 0);

    // Animate the dot's transformation
    tlcollective.to(
      ".home--collective-dot.is--0",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        x: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--1",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--2",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
        x: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--3",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
        x: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--4",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
        x: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--5",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
        x: "0rem",
      },
      0
    );

    tlcollective.to(
      ".home--collective-dot.is--6",
      {
        backgroundColor: "#ffffff",
        borderRadius: "50rem",
        boxShadow: "0 0 0 4rem #F4F2EF",
        width: "27rem",
        height: "27rem",
        y: "0rem",
        x: "0rem",
      },
      0
    );

    gsap.to(".home--collective-dot.is--0", {
      width: "505rem",
      height: "70rem",
      y: "160rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-1",
        start: "top center",
        end: "bottom center",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(
      ".home--collective-dot.is--1,.home--collective-dot.is--2,.home--collective-dot.is--3,.home--collective-dot.is--4,.home--collective-dot.is--5,.home--collective-dot.is--6",
      {
        y: "160rem",
        immediateRender: false, // 👈 fixes the jump
        scrollTrigger: {
          trigger: ".home--search-trigger-1",
          start: "top center",
          end: "bottom center",
          scrub: true,
          markers: false,
        },
      }
    );

    // Fade in search text
    gsap.to(".home--searchtext", {
      opacity: 1,
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-2",
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    // Animate container
    gsap.to(".container--725.is--search", {
      opacity: 1,
      y: "0rem",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-2",
        start: "top center",
        end: "bottom center",
        scrub: true,
        markers: false,
      },
    });

    // Fade in search text
    gsap.to(".home--searchtext", {
      opacity: 0,
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-3",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    // Shrink dot again on trigger 3
    gsap.to(".home--collective-dot.is--0", {
      width: "27rem",
      height: "27rem",
      y: "0rem",
      boxShadow: "0 0 0 3rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-4",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(
      ".home--collective-dot.is--1,.home--collective-dot.is--2,.home--collective-dot.is--3,.home--collective-dot.is--4,.home--collective-dot.is--5,.home--collective-dot.is--6",
      {
        width: "27rem",
        height: "27rem",
        y: "0rem",
        boxShadow: "0 0 0 3rem #F4F2EF",
        immediateRender: false, // 👈 fixes the jump
        scrollTrigger: {
          trigger: ".home--search-trigger-4",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          markers: false,
        },
      }
    );

    gsap.utils.toArray(".svg--lines").forEach((target) => {
      gsap.from(target, {
        opacity: 0,
        scrollTrigger: {
          trigger: target,
          start: "top bottom",
          end: "top bottm -=200",
          scrub: true,
          markers: false,
        },
      });
    });

    // final one

    gsap.to(".home--collective-dot.is--0", {
      width: "300rem",
      height: "174rem",
      borderRadius: "8rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-last",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(".home--collective-dot.is--3", {
      width: "300rem",
      height: "174rem",
      x: "-680rem",
      borderRadius: "8rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-last",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(".home--collective-dot.is--4", {
      width: "300rem",
      height: "174rem",
      x: "-340rem",
      borderRadius: "8rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-last",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(".home--collective-dot.is--5", {
      width: "300rem",
      height: "174rem",
      x: "340rem",
      borderRadius: "8rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-last",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(".home--collective-dot.is--6", {
      width: "300rem",
      height: "174rem",
      x: "680rem",
      borderRadius: "8rem",
      boxShadow: "0 0 0 10rem #F4F2EF",
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--search-trigger-last",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        markers: false,
      },
    });

    gsap.to(".home--collective-dot-inner", {
      opacity: 1,
      immediateRender: false, // 👈 fixes the jump
      scrollTrigger: {
        trigger: ".home--builddeploy--screen",
        start: "top center",
        end: "bottom center",
        scrub: true,
        markers: false,
      },
    });
  },
});
