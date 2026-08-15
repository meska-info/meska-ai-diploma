import Link from "next/link";

type DevicePreviewProps = {
  device: "mobile" | "tablet" | "desktop";
  label: string;
  width: number;
};

const devices = [
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
  { id: "desktop", label: "Desktop" },
] as const;

export function DevicePreview({ device, label, width }: DevicePreviewProps) {
  const frameName = `meska-${device}-preview`;

  return (
    <main className="device-preview-page">
      <header className="device-preview-toolbar">
        <div className="device-preview-title">
          <span>Meska AI · Live review</span>
          <strong>
            {label} · {width}px
          </strong>
        </div>

        <nav className="device-preview-switcher" aria-label="Preview size">
          {devices.map((item) => (
            <a
              className={item.id === device ? "is-active" : ""}
              href={`/preview/${item.id}`}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <nav className="device-preview-pages" aria-label="Preview page">
          <Link href="/" target={frameName}>
            Landing
          </Link>
          <a href="/thank-you" target={frameName}>
            Thank-you
          </a>
        </nav>
      </header>

      <section className="device-preview-stage" aria-label={`${label} preview`}>
        <iframe
          className={`device-preview-frame device-preview-frame-${device}`}
          name={frameName}
          src="/"
          style={{ width }}
          title={`Interactive ${label.toLowerCase()} Meska AI page`}
        />
      </section>
    </main>
  );
}
