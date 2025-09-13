export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true };
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
      document.body.removeChild(textArea);
      return { success: false, error: 'Failed to copy to clipboard' };
    }
  }
};
