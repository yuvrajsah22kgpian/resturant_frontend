import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, PackageCheck } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { Badge } from "@/components/ui/badge";

// If not already defined elsewhere, uncomment and adjust as needed:
// interface Transaction {
//   id: string;
//   date: string | Date;
//   items: { name: string; quantity: number; price: number }[];
//   total: number;
//   status?: string;
// }

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) throw new Error("User ID not found in localStorage.");
        const response = await fetch(`https://resturant-backend-api.onrender.com/api/orders/get_order_history/${uid}`);
        if (!response.ok) throw new Error("Failed to fetch order history.");
        const data = await response.json();

        // Defensive mapping: Ensure items and price/total are numbers
        const convertedTransactions: Transaction[] = data.map((order: any) => ({
          id: order.id,
          date: order.date,
          items: Array.isArray(order.order_details)
            ? order.order_details.map((item: any) => ({
                name: item.name || "-",
                quantity: typeof item.quantity === "number" ? item.quantity : 0,
                price: typeof item.price === "number" ? item.price : 0,
              }))
            : [],
          total: typeof order.total_amount === "number" ? order.total_amount : 0,
          status: order.status || "Completed",
        }));

        setTransactions(convertedTransactions);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <History className="h-6 w-6" />
            Transaction History
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {transactions.length} Orders
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No transactions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      {(() => {
                        const date =
                          typeof transaction.date === "string"
                            ? new Date(transaction.date)
                            : transaction.date;
                        return date instanceof Date && !isNaN(date.getTime())
                          ? date.toLocaleDateString()
                          : "-";
                      })()}
                    </TableCell>
                    <TableCell>
                      {transaction.items && transaction.items.length > 0 ? (
                        transaction.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity}x {item.name} (${typeof item.price === "number" ? item.price.toFixed(2) : "0.00"})
                          </div>
                        ))
                      ) : (
                        <div>-</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${typeof transaction.total === "number" ? transaction.total.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          transaction.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200 flex items-center gap-1 justify-center"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 justify-center"
                        }
                      >
                        <PackageCheck size={14} /> {transaction.status || "Completed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
