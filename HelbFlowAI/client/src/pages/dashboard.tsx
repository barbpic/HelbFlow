import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import AIDisbursementCalculator from "@/components/ai-disbursement-calculator";
import SmartBudgetTracker from "@/components/smart-budget-tracker";
import RecentTransactions from "@/components/recent-transactions";
import LoanRepaymentSummary from "@/components/loan-repayment-summary";
import SystemDiagram from "@/components/system-diagram";
import ProjectStatement from "@/components/project-statement";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background" data-testid="dashboard">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Dashboard Overview</h2>
              <p className="text-sm text-muted-foreground">Monitor disbursements, track budgets, and manage student loans</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
                </Button>
              </div>
              <Button data-testid="button-new-disbursement">
                <Plus className="h-4 w-4 mr-2" />
                New Disbursement
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-content">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AIDisbursementCalculator />
            <SmartBudgetTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <RecentTransactions />
            <LoanRepaymentSummary />
          </div>

          <SystemDiagram />
          <ProjectStatement />
        </main>
      </div>
    </div>
  );
}
