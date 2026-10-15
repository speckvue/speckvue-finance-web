import 'server-only';

/** Sends a single Intl snapshot to the browser so differing ICU versions cannot change option markup. */
const preferenceOptions = () => ({
  currencies: Intl.supportedValuesOf('currency'),
  timezones: Array.from(
    new Set(['UTC', ...Intl.supportedValuesOf('timeZone')]),
  ),
});
export default preferenceOptions;
