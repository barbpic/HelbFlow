import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import StudentProfile from "@/pages/student-profile";
import AIDisbursement from "@/pages/ai-disbursement";
import BudgetTracker from "@/pages/budget-tracker";
import LoanRepayment from "@/pages/loan-repayment";
import BankIntegration from "@/pages/bank-integration";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/student-profile" component={StudentProfile} />
      <Route path="/ai-disbursement" component={AIDisbursement} />
      <Route path="/budget-tracker" component={BudgetTracker} />
      <Route path="/loan-repayment" component={LoanRepayment} />
      <Route path="/bank-integration" component={BankIntegration} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
