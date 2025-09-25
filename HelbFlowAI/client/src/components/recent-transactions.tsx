import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Transaction {
  id: string;
  studentId: string;
  type: string;
  amount: string;
  status: string;
  recipient: string;
  createdAt: string;
  student: {
    firstName: string;
    lastName: string;
    studentId: string;
  };
}

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/disbursements/recent"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-secondary/10 text-secondary";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tuition":
        return "bg-primary/10 text-primary";
      case "upkeep":
        return "bg-accent text-accent-foreground";
      case "books":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2" data-testid="recent-transactions-loading">
        <CardHeader>
          <CardTitle>Recent Disbursements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2" data-testid="recent-transactions">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Disbursements</span>
          <Button variant="ghost" size="sm" data-testid="button-view-all">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions?.map((transaction) => (
                <tr key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b332c61c?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face" 
                        alt="Student" 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {transaction.student.firstName} {transaction.student.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.student.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getTypeColor(transaction.type)}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    KSh {parseFloat(transaction.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No recent disbursements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
