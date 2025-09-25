import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";

// Mock data for demonstration
const repaymentData = {
  totalOutstanding: "2,400,000,000",
  currentMonth: "45,000,000", 
  expected: "52,000,000",
  rate: "86.5",
  collections: {
    standingOrders: 64,
    payrollDeductions: 22,
    manualPayments: 14
  }
};

export default function LoanRepaymentSummary() {
  return (
    <Card className="bg-card" data-testid="loan-repayment-summary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Loan Repayment</span>
          <BarChart3 className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="total-outstanding">
              KSh {repaymentData.totalOutstanding}
            </div>
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Month</span>
              <span className="text-sm font-medium text-foreground" data-testid="current-month">
                KSh {repaymentData.currentMonth}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expected</span>
              <span className="text-sm font-medium text-foreground" data-testid="expected">
                KSh {repaymentData.expected}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Collection Rate</span>
              <span className="text-sm font-medium text-secondary" data-testid="collection-rate">
                {repaymentData.rate}%
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Automated Collections</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standing Orders:</span>
                <span className="text-foreground" data-testid="standing-orders">
                  {repaymentData.collections.standingOrders}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payroll Deductions:</span>
                <span className="text-foreground" data-testid="payroll-deductions">
                  {repaymentData.collections.payrollDeductions}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manual Payments:</span>
                <span className="text-foreground" data-testid="manual-payments">
                  {repaymentData.collections.manualPayments}%
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            data-testid="button-view-analytics"
          >
            View Repayment Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
