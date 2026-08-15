import type { Metadata } from "next";
import { DevicePreview } from "../../components/DevicePreview";

export const metadata: Metadata = {
  title: "Desktop Live Preview",
  robots: { index: false, follow: false },
};

export default function DesktopPreviewPage() {
  return <DevicePreview device="desktop" label="Desktop" width={1440} />;
}
