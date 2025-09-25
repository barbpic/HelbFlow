import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function ProjectStatement() {
  return (
    <Card className="bg-primary/5 border border-primary/20" data-testid="project-statement">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Project Idea Statement</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The HELB Smart Disbursement & Budgeting System revolutionizes student loan management through AI-powered financial intelligence and seamless bank integration. This comprehensive platform optimizes loan disbursements based on course requirements, regional cost variations, and semester calendars, while providing real-time budget tracking with predictive analytics. Partner banks serve as active financial partners, facilitating automated disbursements, monitoring spending patterns, and enabling seamless post-graduation repayment through standing orders and payroll deductions. The system promotes financial literacy and responsible spending through intelligent alerts, personalized advice, and credit profile development, ultimately improving loan recovery rates while supporting student success through disciplined financial management.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-3 border border-border" data-testid="helb-role">
                <h4 className="text-sm font-medium text-foreground mb-1">HELB Role</h4>
                <p className="text-xs text-muted-foreground">Central management, AI processing, policy enforcement, and overall system governance</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border" data-testid="bank-role">
                <h4 className="text-sm font-medium text-foreground mb-1">Bank Role</h4>
                <p className="text-xs text-muted-foreground">Financial infrastructure, account management, transaction processing, and repayment collection</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border" data-testid="student-role">
                <h4 className="text-sm font-medium text-foreground mb-1">Student Role</h4>
                <p className="text-xs text-muted-foreground">Active participation in budget management, financial discipline, and responsible loan utilization</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
