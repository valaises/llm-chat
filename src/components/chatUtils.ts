
export const adjustTextareaHeight = (textareaRef) => {
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.style.height = '56px'; // Reset height to recalculate
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight > 56) {
      const newHeight = Math.min(scrollHeight, 200); // Max height: 200px
      textarea.style.height = `${newHeight}px`;
    }
  }
};
