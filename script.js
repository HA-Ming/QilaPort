document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const scrollToContact = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector("#contact")?.scrollIntoView({
        behavior: motionPreference.matches ? "auto" : "smooth",
        block: "start",
      });
    });
  });
};

const entryCover = document.querySelector("[data-entry-cover]");

if (entryCover && document.documentElement.classList.contains("entry-pending")) {
  const inertElements = [
    document.querySelector(".skip-link"),
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector("footer"),
    document.querySelector(".view-cursor"),
  ].filter(Boolean);
  const enterButton = entryCover.querySelector("[data-enter-portfolio]");
  let isLeaving = false;
  let touchStartY = null;

  document.body.classList.add("entry-active");
  inertElements.forEach((element) => {
    element.inert = true;
    element.setAttribute("aria-hidden", "true");
  });

  const finishEntry = (scrollToContactTarget = false) => {
    entryCover.hidden = true;
    document.documentElement.classList.remove("entry-pending");
    document.body.classList.remove("entry-active");
    inertElements.forEach((element) => {
      element.inert = false;
      element.removeAttribute("aria-hidden");
    });
    if (scrollToContactTarget) {
      history.replaceState(null, "", "#contact");
      document.querySelector("#contact")?.focus({ preventScroll: true });
      scrollToContact();
    } else {
      document.querySelector("main")?.focus({ preventScroll: true });
    }
  };

  const beginEntry = (scrollToContactTarget = false) => {
    if (isLeaving) return;
    isLeaving = true;
    sessionStorage.setItem("aqilah-entry-seen", "1");
    entryCover.classList.add("is-leaving");
    window.setTimeout(
      () => finishEntry(scrollToContactTarget),
      motionPreference.matches ? 20 : 1150,
    );
  };

  const onCoverWheel = (event) => {
    if (event.deltaY <= 0) return;
    event.preventDefault();
    beginEntry();
  };
  const onCoverTouchStart = (event) => {
    touchStartY = event.changedTouches[0]?.clientY ?? null;
  };
  const onCoverTouchEnd = (event) => {
    const endY = event.changedTouches[0]?.clientY;
    if (touchStartY !== null && endY !== undefined && touchStartY - endY > 36) beginEntry();
    touchStartY = null;
  };
  const onCoverKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      beginEntry();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      beginEntry();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...entryCover.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  enterButton?.addEventListener("click", () => beginEntry());
  entryCover.querySelector("[data-entry-contact]")?.addEventListener("click", (event) => {
    event.preventDefault();
    beginEntry(true);
  });
  entryCover.querySelectorAll('a[href="work.html"], a[href="about.html"]').forEach((link) => {
    link.addEventListener("click", () => sessionStorage.setItem("aqilah-entry-seen", "1"));
  });
  entryCover.addEventListener("wheel", onCoverWheel, { passive: false });
  entryCover.addEventListener("touchstart", onCoverTouchStart, { passive: true });
  entryCover.addEventListener("touchend", onCoverTouchEnd, { passive: true });
  entryCover.addEventListener("keydown", onCoverKeyDown);
  enterButton?.focus({ preventScroll: true });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && sessionStorage.getItem("aqilah-entry-seen") === "1") finishEntry();
  });
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (!link) return;

  const destination = new URL(link.href, location.href);
  if (destination.hash === "#contact" && destination.pathname !== location.pathname) {
    sessionStorage.setItem("aqilah-contact-pending", "true");
  }
});

if (location.hash === "#contact") {
  if (document.readyState === "complete") {
    scrollToContact();
  } else {
    window.addEventListener("load", scrollToContact, { once: true });
  }
}

window.addEventListener("hashchange", () => {
  if (location.hash === "#contact") scrollToContact();
});

window.addEventListener("pageshow", (event) => {
  if (location.hash === "#contact" && sessionStorage.getItem("aqilah-contact-pending")) {
    sessionStorage.removeItem("aqilah-contact-pending");
    window.setTimeout(scrollToContact, 80);
  }
});

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      if (menuButton.getClientRects().length) menuButton.focus();
    }
  });

  window.matchMedia("(min-width: 721px)").addEventListener("change", closeMenu);
}

const revealElements = document.querySelectorAll(".reveal");
document.querySelectorAll(".hero__identity")
  .forEach((element) => element.classList.add("is-visible"));

if (motionPreference.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const parallaxImages = document.querySelectorAll("[data-parallax], [data-scroll-image]");

if (!motionPreference.matches && parallaxImages.length) {
  let frameRequested = false;

  const updateParallax = () => {
    parallaxImages.forEach((image) => {
      const bounds = image.parentElement.getBoundingClientRect();
      const offset = Math.max(-18, Math.min(18, (bounds.top + bounds.height / 2 - window.innerHeight / 2) * -0.032));
      image.style.setProperty("--scroll-y", `${offset.toFixed(2)}px`);
    });
    frameRequested = false;
  };

  window.addEventListener("scroll", () => {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  updateParallax();
}

const projectLinks = [...document.querySelectorAll("[data-project-id]")];
const viewCursor = document.querySelector(".view-cursor");

if (finePointer.matches && viewCursor && !motionPreference.matches) {
  document.documentElement.classList.add("has-view-cursor");
  let cursorFrame = 0;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!cursorFrame) {
      cursorFrame = window.requestAnimationFrame(() => {
        viewCursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        cursorFrame = 0;
      });
    }

  }, { passive: true });

  projectLinks.forEach((imageLink) => {
    imageLink.addEventListener("pointerenter", () => viewCursor.classList.add("is-active"));
    imageLink.addEventListener("pointerleave", () => viewCursor.classList.remove("is-active"));
    imageLink.addEventListener("pointermove", (event) => {
      const bounds = imageLink.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      imageLink.style.setProperty("--pointer-x", `${(x * -10).toFixed(2)}px`);
      imageLink.style.setProperty("--pointer-y", `${(y * -8).toFixed(2)}px`);
    }, { passive: true });
    imageLink.addEventListener("pointerleave", () => {
      imageLink.style.setProperty("--pointer-x", "0px");
      imageLink.style.setProperty("--pointer-y", "0px");
    });
  });
}
