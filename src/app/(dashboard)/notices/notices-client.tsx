"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pin, Trash2 } from "lucide-react";
import { createNotice, deleteNotice, togglePin } from "@/services/notice.service";
import { formatDate } from "@/lib/utils/dates";

interface NoticeRow {
  notice: {
    id: string;
    title: string;
    body: string;
    category: string;
    isPinned: boolean;
    publishedAt: Date | null;
    createdAt: Date;
  };
  author: { name: string | null } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-800",
  maintenance: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  event: "bg-green-100 text-green-800",
  emergency: "bg-red-100 text-red-800",
  financial: "bg-amber-100 text-amber-800",
  rule_update: "bg-orange-100 text-orange-800",
};

export function NoticesClient({
  societyId,
  notices,
}: {
  societyId: string;
  notices: NoticeRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      await createNotice({
        societyId,
        title: fd.get("title") as string,
        body: fd.get("body") as string,
        category: (fd.get("category") as string) as "general",
        isPinned: fd.get("isPinned") === "on",
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notice?")) return;
    await deleteNotice(id);
    router.refresh();
  }

  async function handleTogglePin(id: string, isPinned: boolean) {
    await togglePin(id, !isPinned);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notice Board</h1>
          <p className="text-muted-foreground">
            Society announcements and updates
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Notice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Water supply interruption on Sunday"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <textarea
                  id="body"
                  name="body"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Dear residents..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" defaultValue="general">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="rule_update">Rule Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPinned" name="isPinned" />
                <Label htmlFor="isPinned">Pin to top</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Publishing..." : "Publish Notice"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notices.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No notices yet</CardTitle>
            <CardDescription>
              Create your first notice to keep residents informed
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map((row) => (
            <Card
              key={row.notice.id}
              className={row.notice.isPinned ? "border-primary/50" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {row.notice.isPinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}
                      <CardTitle className="text-base">
                        {row.notice.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          CATEGORY_COLORS[row.notice.category] || CATEGORY_COLORS.general
                        }`}
                      >
                        {row.notice.category.replace("_", " ")}
                      </span>
                      <span>
                        {formatDate(row.notice.createdAt)}
                      </span>
                      {row.author?.name && (
                        <span>by {row.author.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleTogglePin(row.notice.id, row.notice.isPinned)
                      }
                    >
                      <Pin
                        className={`h-4 w-4 ${
                          row.notice.isPinned
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.notice.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {row.notice.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
