"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export function QRDisplay({ value, size = 220 }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (!value) return;

    QRCode.toDataURL(value, { width: size, margin: 1 }).then((url) => {
      if (!ignore) setDataUrl(url);
    });

    return () => {
      ignore = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-md border text-xs text-muted-foreground"
        style={{ width: size, height: size }}
      >
        Generating...
      </div>
    );
  }

  return (
    <Image
      src={dataUrl}
      alt="Reservation QR code"
      width={size}
      height={size}
      unoptimized
      className="rounded-md border"
    />
  );
}
