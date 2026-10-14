const formatDate = (
  value: string,
  {
    locale = 'en-US',
    timeZone = 'UTC',
  }: { locale?: string; timeZone?: string } = {},
): string => {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00Z' : value,
  );
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date);
};

export default formatDate;
