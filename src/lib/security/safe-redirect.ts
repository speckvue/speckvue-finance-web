const safeRedirect = (value: unknown, fallback = '/dashboard'): string => {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return fallback;
  try {
    const base = 'https://speckvue.invalid';
    const url = new URL(value, base);
    if (
      url.origin !== base ||
      /[\\\u0000-\u0020\u007f]/.test(decodeURIComponent(value))
    )
      return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
};

export default safeRedirect;
