"use client";

import { useEffect, useRef } from "react";

const CONTAINER_ID = "qr-scanner-region";

export function QRScanner({ onScan, onError }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let active = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!active || !containerRef.current) return;

      const scanner = new Html5Qrcode(CONTAINER_ID);
      scannerRef.current = scanner;

      Html5Qrcode.getCameras()
        .then((cameras) => {
          if (!active || !cameras?.length) {
            onError?.("No camera found.");
            return;
          }

          scanner
            .start(
              cameras[0].id,
              { fps: 10, qrbox: 250 },
              (decodedText) => onScan?.(decodedText),
              () => {}
            )
            .catch((err) => onError?.(err?.message || "Could not start camera."));
        })
        .catch((err) => onError?.(err?.message || "Camera access denied."));
    });

    return () => {
      active = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [onScan, onError]);

  return (
    <div
      id={CONTAINER_ID}
      ref={containerRef}
      className="w-full max-w-sm overflow-hidden rounded-md border"
    />
  );
}
