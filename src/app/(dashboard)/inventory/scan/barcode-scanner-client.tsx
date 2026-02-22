"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Camera, Keyboard, Plus, Search } from "lucide-react";
import { getInventoryItemByBarcode } from "@/services/inventory.service";

export function BarcodeScannerClient({
  societyId,
}: {
  societyId: string;
}) {
  const router = useRouter();
  const scannerRef = useRef<unknown>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lookupResult, setLookupResult] = useState<
    null | "not_found" | { id: string; name: string }
  >(null);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBarcodeLookup = useCallback(
    async (barcode: string) => {
      setError("");
      setLoading(true);
      setScannedBarcode(barcode);
      try {
        const item = await getInventoryItemByBarcode(societyId, barcode);
        if (item) {
          router.push(`/inventory/${item.id}`);
        } else {
          setLookupResult("not_found");
        }
      } catch {
        setError("Failed to lookup barcode");
      } finally {
        setLoading(false);
      }
    },
    [societyId, router]
  );

  useEffect(() => {
    let scanner: { clear: () => Promise<void> } | null = null;

    async function initScanner() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        const instance = new Html5QrcodeScanner(
          "barcode-reader",
          {
            fps: 10,
            qrbox: { width: 300, height: 100 },
            rememberLastUsedCamera: true,
          },
          false
        );

        instance.render(
          async (decodedText: string) => {
            instance.clear().catch(() => {});
            await handleBarcodeLookup(decodedText);
          },
          () => {
            // Scan in progress — no barcode detected yet
          }
        );

        scanner = instance;
        scannerRef.current = instance;
      } catch {
        setError("Camera not available. Use manual entry instead.");
      }
    }

    initScanner();

    return () => {
      scanner?.clear().catch(() => {});
    };
  }, [handleBarcodeLookup]);

  async function handleManualLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    await handleBarcodeLookup(manualBarcode.trim());
  }

  function resetScan() {
    setLookupResult(null);
    setScannedBarcode("");
    setError("");
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Scan Barcode</h1>
          <p className="text-muted-foreground">
            Scan an asset barcode or enter it manually
          </p>
        </div>
      </div>

      {/* Result display */}
      {lookupResult === "not_found" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base">Asset Not Found</CardTitle>
            <CardDescription>
              No asset found for barcode:{" "}
              <code className="font-mono">{scannedBarcode}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href={`/inventory/new?barcode=${encodeURIComponent(scannedBarcode)}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Register as New Asset
              </Button>
            </Link>
            <Button variant="outline" onClick={resetScan}>
              Scan Again
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Looking up barcode...</p>
          </CardContent>
        </Card>
      )}

      {/* Scanner Tabs */}
      {!lookupResult && !loading && (
        <Tabs defaultValue="camera">
          <TabsList className="w-full">
            <TabsTrigger value="camera" className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">
              <Keyboard className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera">
            <Card>
              <CardContent className="pt-6">
                <div
                  id="barcode-reader"
                  className="w-full overflow-hidden rounded-md"
                />
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Point your camera at a barcode to scan
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enter Barcode</CardTitle>
                <CardDescription>
                  Type the barcode text printed on the asset label
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualLookup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualBarcode">Barcode</Label>
                    <Input
                      id="manualBarcode"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="e.g., INV-A3K7M2X9"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Lookup
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
