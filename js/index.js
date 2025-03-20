function isFixed(current, fixedAt) {
  return current <= fixedAt;
}

function isPinned(current, previous) {
  return current <= previous;
}

function isReleased(current, previous, fixedAt) {
  return !isPinned(current, previous) && !isFixed(current, fixedAt);
}

class Headroom {
  constructor(options = {}) {
    this.fixedAt = options.fixedAt || 0;
    this.onPin = options.onPin || (() => {});
    this.onFix = options.onFix || (() => {});
    this.onRelease = options.onRelease || (() => {});

    // State variables
    this.lastScrollTop = 0;
    this.isScrollingUp = false;
    this.isResizing = false;
    this.isCurrentlyPinned = false;
    this.currentScrollPosition = 0;

    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.checkPosition = this.checkPosition.bind(this);

    // Initialize
    this.init();
  }

  init() {
    // Add event listeners
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);

    // Initial setup
    this.currentScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    this.lastScrollTop = this.currentScrollPosition;

    this.isCurrentlyPinned = true;
    this.onPin();
    this.checkPosition();
  }

  handleResize() {
    this.isResizing = true;
    clearTimeout(this.resizeTimer);

    this.resizeTimer = setTimeout(() => {
      this.isResizing = false;
    }, 300);
  }

  handleScroll() {
    if (this.isResizing) return;

    this.currentScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    this.isScrollingUp = this.currentScrollPosition < this.lastScrollTop;

    this.checkPosition();
    this.lastScrollTop = this.currentScrollPosition;
  }

  checkPosition() {
    const isInFixedPosition = this.currentScrollPosition <= this.fixedAt;

    if (isInFixedPosition) {
      if (!this.isCurrentlyPinned) {
        this.isCurrentlyPinned = true;
        this.onPin();
      }
      this.onFix();
    } else if (this.isScrollingUp) {
      if (!this.isCurrentlyPinned) {
        this.isCurrentlyPinned = true;
        this.onPin();
      }
    } else if (
      this.currentScrollPosition > this.fixedAt &&
      !this.isScrollingUp
    ) {
      if (this.isCurrentlyPinned) {
        this.isCurrentlyPinned = false;
        this.onRelease();
      }
    }
  }

  getState() {
    return this.isCurrentlyPinned;
  }

  destroy() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    clearTimeout(this.resizeTimer);
  }
}

function initHeadroom() {
  const headroom = new Headroom({
    fixedAt: 200,
    onPin: () => {
      document.querySelector(".header-headroom").classList.add("pinned");
    },
    onFix: () => {
      document.querySelector(".header-headroom").classList.add("fixed");
    },
    onRelease: () => {
      document
        .querySelector(".header-headroom")
        .classList.remove("pinned", "fixed");
    },
  });

  return headroom;
}

if (typeof document !== "undefined") {
  initHeadroom();
}

let lastScrollTop = 0;

const header = document.querySelector(".header-headroom");
const headerHeight = header.offsetHeight;
const skipPx = headerHeight * 5;

window.addEventListener("scroll", () => {
  let currentScroll = window.scrollY;

  if (currentScroll <= headerHeight) {
    header.classList.remove("visible", "hidden");
    header.classList.add("pinned");
  } else if (currentScroll < lastScrollTop) {
    header.classList.add("visible");
    header.classList.remove("hidden", "pinned");
  } else if (currentScroll > lastScrollTop && currentScroll > skipPx) {
    header.classList.add("hidden");
    header.classList.remove("visible", "pinned");
  }

  lastScrollTop = currentScroll;
});
