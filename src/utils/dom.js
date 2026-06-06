export function isTypingOrAdjusting(target) {
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target?.tagName) || target?.isContentEditable;
}
