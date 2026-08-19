"use client";

import { useEffect, useRef } from "react";

const CONTAINER_ID = "qr-scanner-region";
const SCAN_CONFIG = { fps: 10, qrbox: 250 };

// Tries the rear/back camera first (what a gate scanner needs), falling back
// progressively if the device/browser can't honor the strict constraint.
async function startWithBackCameraPreference(scanner, onDecode) {
  try {
    await scanner.start({ facingMode: { exact: "environment" } }, SCAN_CONFIG, onDecode, () => {});
    return;
  } catch {
    // fall through
  }

  try {
    await scanner.start({ facingMode: "environment" }, SCAN_CONFIG, onDecode, () => {});
    return;
  } catch {
    // fall through
  }

  const { Html5Qrcode } = await import("html5-qrcode");
  const cameras = await Html5Qrcode.getCameras();
  if (!cameras?.length) throw new Error("No camera found.");

  const backCamera = cameras.find((c) => /back|rear|environment/i.test(c.label));
  const cameraId = (backCamera || cameras[cameras.length - 1]).id;

  await scanner.start(cameraId, SCAN_CONFIG, onDecode, () => {});
}

export function QRScanner({ onScan, onError }) {
  const containerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let active = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!active || !containerRef.current) return;

      const scanner = new Html5Qrcode(CONTAINER_ID);
      scannerRef.current = scanner;

      startWithBackCameraPreference(scanner, (decodedText) => onScan?.(decodedText)).catch((err) => {
        if (active) onError?.(err?.message || "Could not start camera.");
      });
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
