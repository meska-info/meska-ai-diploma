import type { Metadata } from "next";
import { DevicePreview } from "../../components/DevicePreview";

export const metadata: Metadata = {
  title: "Mobile Live Preview",
  robots: { index: false, follow: false },
};

export default function MobilePreviewPage() {
  return <DevicePreview device="mobile" label="Mobile" width={390} />;
}
