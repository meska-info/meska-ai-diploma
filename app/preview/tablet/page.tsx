import type { Metadata } from "next";
import { DevicePreview } from "../../components/DevicePreview";

export const metadata: Metadata = {
  title: "Tablet Live Preview",
  robots: { index: false, follow: false },
};

export default function TabletPreviewPage() {
  return <DevicePreview device="tablet" label="Tablet" width={768} />;
}
