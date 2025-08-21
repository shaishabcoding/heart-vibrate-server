export const otpGenerator = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) otp += digits[randomValues[i] % 10];

  return otp;
};
