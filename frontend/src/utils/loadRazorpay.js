/**
 * Utility to dynamically inject and load the official Razorpay Checkout SDK
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay is already loaded on the window, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
