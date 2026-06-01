import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";

export function generateTwoFactorSecret(email: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: "NEXORA AI",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string) {
  return QRCode.toDataURL(uri);
}

export function verifyTwoFactorToken(secretBase32: string, token: string) {
  const totp = new TOTP({
    issuer: "NEXORA AI",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });

  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}
