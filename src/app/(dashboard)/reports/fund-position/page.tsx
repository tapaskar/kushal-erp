import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getFundPosition } from "@/services/report.service";
import { formatINR } from "@/lib/utils/currency";
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

export default async function FundPositionPage() {
  const session = await getSession();
  if (!session?.societyId) redirect("/society/setup");

  const data = await getFundPosition(session.societyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fund Position</h1>
        <p className="text-muted-foreground">
          Balance sheet summary from ledger entries
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {data.assets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No asset entries.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assets.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground mr-2">
                          {item.code}
                        </span>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(item.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Assets</TableCell>
                    <TableCell className="text-right text-blue-700">
                      {formatINR(data.totalAssets)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Liabilities + Equity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700">Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              {data.liabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No liability entries.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.liabilities.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell>
                          <span className="text-xs text-muted-foreground mr-2">
                            {item.code}
                          </span>
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatINR(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total Liabilities</TableCell>
                      <TableCell className="text-right text-orange-700">
                        {formatINR(data.totalLiabilities)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">Equity / Reserves</CardTitle>
            </CardHeader>
            <CardContent>
              {data.equity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No equity entries.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.equity.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell>
                          <span className="text-xs text-muted-foreground mr-2">
                            {item.code}
                          </span>
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatINR(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total Equity</TableCell>
                      <TableCell className="text-right text-purple-700">
                        {formatINR(data.totalEquity)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounting equation check */}
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground text-center">
          Assets ({formatINR(data.totalAssets)}) = Liabilities (
          {formatINR(data.totalLiabilities)}) + Equity (
          {formatINR(data.totalEquity)})
          {Math.abs(
            data.totalAssets - data.totalLiabilities - data.totalEquity
          ) < 0.01 ? (
            <span className="ml-2 text-green-600 font-medium">
              Balanced
            </span>
          ) : (
            <span className="ml-2 text-destructive font-medium">
              Imbalanced by{" "}
              {formatINR(
                Math.abs(
                  data.totalAssets - data.totalLiabilities - data.totalEquity
                )
              )}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
