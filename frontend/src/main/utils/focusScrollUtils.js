// Scrolls the commons card named by the ?focus={commonsId} query parameter
// into view, leaving room for the sticky navbar so the whole card is visible.

const FOCUS_SCROLL_MARGIN = 16;

const getFocusTargetId = (search) => new URLSearchParams(search).get("focus");

const computeScrollTop = ({ elementTop, scrollY, navbarHeight }) =>
  elementTop + scrollY - navbarHeight - FOCUS_SCROLL_MARGIN;

const scrollToFocusTarget = ({ targetId, win = window }) => {
  const element = win.document.getElementById(targetId);
  if (!element) {
    return false;
  }
  const navbar = win.document.querySelector(".navbar");
  const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
  const top = computeScrollTop({
    elementTop: element.getBoundingClientRect().top,
    scrollY: win.scrollY,
    navbarHeight,
  });
  win.scrollTo({ top, behavior: "smooth" });
  return true;
};

export {
  FOCUS_SCROLL_MARGIN,
  getFocusTargetId,
  computeScrollTop,
  scrollToFocusTarget,
};
