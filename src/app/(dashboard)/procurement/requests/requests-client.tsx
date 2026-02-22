"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Plus, Search, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createRfq } from "@/services/procurement.service";
import {
  PR_STATUS_COLORS,
  PR_PRIORITY_COLORS,
  VENDOR_CATEGORY_LABEL,
} from "@/lib/constants";

type PR = {
  pr: {
    id: string;
    referenceNo: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    requiredByDate: string | null;
    createdAt: Date;
  };
  requestedByUser: { name: string } | null;
};

export function RequestsClient({
  requests,
  societyId,
}: {
  requests: PR[];
  societyId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rfqPrId, setRfqPrId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState("");
  const [terms, setTerms] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = requests.filter(({ pr }) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      pr.title.toLowerCase().includes(q) ||
      pr.referenceNo.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || pr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleCreateRfq() {
    if (!rfqPrId || !deadline) {
      toast.error("Please set a deadline");
      return;
    }
    startTransition(async () => {
      try {
        const rfq = await createRfq(rfqPrId, { deadline, terms: terms || undefined });
        toast.success("RFQ created & emails sent to matching vendors");
        setRfqPrId(null);
        router.push(`/procurement/rfq/${rfq.id}`);
      } catch (err) {
        toast.error((err as Error).message || "Failed to create RFQ");
      }
    });
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" /> Purchase Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Raise and manage internal procurement needs
          </p>
        </div>
        <Button asChild>
          <Link href="/procurement/requests/new">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="rfq_sent">RFQ Sent</SelectItem>
                <SelectItem value="quotes_received">Quotes Received</SelectItem>
                <SelectItem value="po_created">PO Created</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Required By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No purchase requests found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ pr, requestedByUser }) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-mono text-xs">{pr.referenceNo}</TableCell>
                    <TableCell>
                      <p className="font-medium">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        By {requestedByUser?.name || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {VENDOR_CATEGORY_LABEL[pr.category] || pr.category}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          PR_PRIORITY_COLORS[pr.priority] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pr.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {pr.requiredByDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {pr.requiredByDate}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          PR_STATUS_COLORS[pr.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pr.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {pr.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRfqPrId(pr.id)}
                        >
                          <Send className="h-3 w-3 mr-1" /> Create RFQ
                        </Button>
                      )}
                      {pr.status === "rfq_sent" && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/procurement/requests`}>View RFQ</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create RFQ Dialog */}
      <Dialog open={!!rfqPrId} onOpenChange={(o) => !o && setRfqPrId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create RFQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              An RFQ will be created and emails automatically sent to all approved
              vendors matching the request category.
            </p>
            <div className="space-y-1.5">
              <Label>Quote Deadline *</Label>
              <Input
                type="date"
                min={minDateStr}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Terms & Conditions (optional)</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Payment terms, delivery conditions, quality standards..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRfqPrId(null)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRfq} disabled={isPending || !deadline}>
                {isPending ? "Sending..." : "Create & Send RFQ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
