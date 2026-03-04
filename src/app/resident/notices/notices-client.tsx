"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";
import { Pin } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-800",
  maintenance: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  event: "bg-green-100 text-green-800",
  emergency: "bg-red-100 text-red-800",
  financial: "bg-amber-100 text-amber-800",
  rule_update: "bg-orange-100 text-orange-800",
};

interface Props {
  notices: Array<{
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
  }>;
}

export function ResidentNoticesClient({ notices }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notices & Announcements</h1>
        <p className="text-muted-foreground">
          Society announcements and updates
        </p>
      </div>

      {notices.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No notices published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((row) => (
            <Card
              key={row.notice.id}
              className={row.notice.isPinned ? "border-primary/50" : undefined}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {row.notice.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      <h3 className="font-semibold text-sm">
                        {row.notice.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {row.notice.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[row.notice.category] ||
                        CATEGORY_COLORS.general
                      }`}
                    >
                      {row.notice.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(row.notice.createdAt)}
                    </span>
                    {row.author?.name && (
                      <span className="text-xs text-muted-foreground">
                        by {row.author.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
