"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Radio, QrCode, Download, Printer } from "lucide-react";
import { addBeacon } from "@/services/staff-admin.service";
import QRCode from "qrcode";

interface BeaconRow {
  id: string;
  uuid: string;
  major: number;
  minor: number;
  label: string;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  floor: number | null;
  createdAt: Date | string;
}

export function BeaconsClient({ beacons }: { beacons: BeaconRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrBeacon, setQrBeacon] = useState<BeaconRow | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  async function showQrCode(beacon: BeaconRow) {
    setQrBeacon(beacon);
    const qrValue = `rwa://beacon/${beacon.id}`;
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      setQrOpen(true);
    } catch (err) {
      console.error("QR generation error:", err);
    }
  }

  function downloadQr() {
    if (!qrDataUrl || !qrBeacon) return;
    const link = document.createElement("a");
    link.download = `beacon-qr-${qrBeacon.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrDataUrl;
    link.click();
  }

  function printQr() {
    if (!qrDataUrl || !qrBeacon) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${qrBeacon.label}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
          <h2>${qrBeacon.label}</h2>
          <p style="color:#666;">${qrBeacon.location || ""}</p>
          <img src="${qrDataUrl}" style="width:300px;height:300px;" />
          <p style="color:#999;font-size:12px;margin-top:16px;">Scan to mark presence</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  const filtered = beacons.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.label.toLowerCase().includes(q) ||
      b.uuid.toLowerCase().includes(q) ||
      (b.location && b.location.toLowerCase().includes(q))
    );
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const floorStr = fd.get("floor") as string;

    try {
      await addBeacon({
        uuid: fd.get("uuid") as string,
        major: parseInt(fd.get("major") as string),
        minor: parseInt(fd.get("minor") as string),
        label: fd.get("label") as string,
        location: (fd.get("location") as string) || undefined,
        latitude: (fd.get("latitude") as string) || undefined,
        longitude: (fd.get("longitude") as string) || undefined,
        floor: floorStr ? parseInt(floorStr) : undefined,
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Beacon Management</h1>
            <p className="text-muted-foreground">
              Manage BLE beacons for patrol and location tracking
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Beacon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Beacon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uuid">UUID</Label>
                <Input
                  id="uuid"
                  name="uuid"
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    name="major"
                    type="number"
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minor">Minor</Label>
                  <Input
                    id="minor"
                    name="minor"
                    type="number"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Main Gate Beacon"
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Main Gate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    placeholder="28.6139"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    placeholder="77.2090"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Beacon"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by label, UUID, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
          <Radio className="h-4 w-4" />
          <span>{beacons.length} beacon{beacons.length !== 1 ? "s" : ""} registered</span>
        </div>
      </div>

      {/* Beacons Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No beacons found</CardTitle>
            <CardDescription>
              {beacons.length === 0
                ? "Add your first beacon to get started"
                : "No beacons match your search"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead className="text-right">Major</TableHead>
                <TableHead className="text-right">Minor</TableHead>
                <TableHead className="text-right">Floor</TableHead>
                <TableHead className="text-center">QR Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((beacon) => (
                <TableRow key={beacon.id}>
                  <TableCell className="font-medium">
                    {beacon.label}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {beacon.location || "---"}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {beacon.uuid.substring(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{beacon.major}</TableCell>
                  <TableCell className="text-right">{beacon.minor}</TableCell>
                  <TableCell className="text-right">
                    {beacon.floor !== null ? beacon.floor : "---"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showQrCode(beacon)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code - {qrBeacon?.label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrBeacon?.location && (
              <p className="text-sm text-muted-foreground">{qrBeacon.location}</p>
            )}
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${qrBeacon?.label}`}
                className="w-64 h-64 border rounded-lg"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Staff can scan this QR code to mark their presence in this area
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadQr}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={printQr}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
