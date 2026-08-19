"use client";

import { useState } from "react";
import { QRScanner } from "@/components/qr/QRScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function ScanClient() {
  const [attempt, setAttempt] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleScan(decodedText) {
    if (loading || !scanning) return;
    setLoading(true);
    setScanning(false);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/reservations/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: decodedText }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        setError(data?.error || "Verification failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error verifying QR code.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setScanning(true);
    setAttempt((a) => a + 1);
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      {scanning && <QRScanner key={attempt} onScan={handleScan} onError={setError} />}

      {loading && <p className="text-sm text-muted-foreground">Verifying...</p>}

      {!scanning && error && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Invalid</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={reset} className="w-full">Scan next</Button>
          </CardFooter>
        </Card>
      )}

      {!scanning && result?.success && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Valid reservation</CardTitle>
            <CardDescription>Vehicle may enter — slot marked occupied.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Slot</span>
              <Badge className="text-base">{result.slot.slotCode}</Badge>
            </div>
            <p className="text-sm">
              Zone: <span className="font-medium">{result.zone?.name || "—"}</span>
            </p>
            <p className="text-sm">
              Reserved by: <span className="font-medium">{result.userName}</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={reset} className="w-full">Scan next</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
