// Bengali Numerals and formatting helper

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function formatSecondsToBengali(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${toBengaliNumber(mins)}:${toBengaliNumber(secs < 10 ? '0' + secs : secs)}`;
  }
  return `${toBengaliNumber(secs)} সেকেন্ড`;
}
