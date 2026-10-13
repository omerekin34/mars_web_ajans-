export function whatsAppUrl(message: string, phoneDigits: string) {
  const digits = phoneDigits.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
