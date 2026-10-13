import { FooterView } from "@/components/footer-view";
import { getSiteSettings } from "@/lib/public-content";

export async function Footer() {
  const settings = await getSiteSettings();
  return <FooterView settings={settings} />;
}
