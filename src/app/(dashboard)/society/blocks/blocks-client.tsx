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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { createBlock, deleteBlock } from "@/services/society.service";
import Link from "next/link";

interface Block {
  id: string;
  name: string;
  code: string;
  totalFloors: number;
  sortOrder: number;
}

export function BlocksClient({
  societyId,
  initialBlocks,
}: {
  societyId: string;
  initialBlocks: Block[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createBlock({
        societyId,
        name: formData.get("name") as string,
        code: formData.get("code") as string,
        totalFloors: Number(formData.get("totalFloors")),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(blockId: string) {
    if (!confirm("Delete this block? All floors and units in it will be removed."))
      return;
    await deleteBlock(blockId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blocks / Wings</h1>
          <p className="text-muted-foreground">
            Add towers, wings, or buildings in your society
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Block
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Block / Wing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Block Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="A Wing"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code (short)</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="A"
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalFloors">
                  Total Floors (excl. ground)
                </Label>
                <Input
                  id="totalFloors"
                  name="totalFloors"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="14"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Add Block"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {initialBlocks.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle>No blocks yet</CardTitle>
            <CardDescription>
              Add your first block or wing to get started
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Floors</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialBlocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-medium">{block.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{block.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {block.totalFloors} + Ground
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(block.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex justify-between">
        <Link href="/society/setup">
          <Button variant="outline">Back to Setup</Button>
        </Link>
        <Link href="/society/units">
          <Button>Continue to Units</Button>
        </Link>
      </div>
    </div>
  );
}
