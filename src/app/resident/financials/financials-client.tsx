"use client";

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
import { formatINR } from "@/lib/utils/currency";

interface Props {
  incomeExpense: {
    income: Array<{ code: string; name: string; amount: number }>;
    expenses: Array<{ code: string; name: string; amount: number }>;
    totalIncome: number;
    totalExpense: number;
    surplus: number;
  };
  fundPosition: {
    assets: Array<{ code: string; name: string; balance: number }>;
    liabilities: Array<{ code: string; name: string; balance: number }>;
    equity: Array<{ code: string; name: string; balance: number }>;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  financialYear: string;
}

export function FinancialsClient({
  incomeExpense,
  fundPosition,
  financialYear,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Society Financials</h1>
        <p className="text-muted-foreground">FY {financialYear}</p>
      </div>

      {/* Surplus / Deficit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>
              {incomeExpense.surplus >= 0 ? "Surplus" : "Deficit"}
            </span>
            <span
              className={
                incomeExpense.surplus >= 0 ? "text-green-700" : "text-red-700"
              }
            >
              {formatINR(Math.abs(incomeExpense.surplus))}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Income {formatINR(incomeExpense.totalIncome)} - Expenses{" "}
            {formatINR(incomeExpense.totalExpense)}
          </p>
        </CardContent>
      </Card>

      {/* Income & Expense */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Income</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeExpense.income.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No income recorded.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeExpense.income.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground mr-2">
                          {item.code}
                        </span>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Income</TableCell>
                    <TableCell className="text-right text-green-700">
                      {formatINR(incomeExpense.totalIncome)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeExpense.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expenses recorded.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeExpense.expenses.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground mr-2">
                          {item.code}
                        </span>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Expenses</TableCell>
                    <TableCell className="text-right text-red-700">
                      {formatINR(incomeExpense.totalExpense)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fund Position */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Fund Position</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {fundPosition.assets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No asset entries.
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
                    {fundPosition.assets.map((item) => (
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
                        {formatINR(fundPosition.totalAssets)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-700">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                {fundPosition.liabilities.length === 0 ? (
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
                      {fundPosition.liabilities.map((item) => (
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
                          {formatINR(fundPosition.totalLiabilities)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-700">
                  Equity / Reserves
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fundPosition.equity.length === 0 ? (
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
                      {fundPosition.equity.map((item) => (
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
                          {formatINR(fundPosition.totalEquity)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Accounting Equation Check */}
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground text-center">
          Assets ({formatINR(fundPosition.totalAssets)}) = Liabilities (
          {formatINR(fundPosition.totalLiabilities)}) + Equity (
          {formatINR(fundPosition.totalEquity)})
          {Math.abs(
            fundPosition.totalAssets -
              fundPosition.totalLiabilities -
              fundPosition.totalEquity
          ) < 0.01 ? (
            <span className="ml-2 text-green-600 font-medium">Balanced</span>
          ) : (
            <span className="ml-2 text-destructive font-medium">
              Imbalanced by{" "}
              {formatINR(
                Math.abs(
                  fundPosition.totalAssets -
                    fundPosition.totalLiabilities -
                    fundPosition.totalEquity
                )
              )}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
