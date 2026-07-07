const HASH_SCROLL_INTO_VIEW_OPTIONS = Object.freeze({
  behavior: "smooth",
  block: "start",
});

const getHashTargetId = (hash) => hash.replace("#", "");

const shouldScrollToHash = ({ hash, commonsLength, lastScrolledHash }) =>
  Boolean(hash) && commonsLength > 0 && hash !== lastScrolledHash;

export { HASH_SCROLL_INTO_VIEW_OPTIONS, getHashTargetId, shouldScrollToHash };
