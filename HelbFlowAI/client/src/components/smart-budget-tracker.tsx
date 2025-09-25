import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, AlertTriangle, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BudgetData {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

// Mock data for demonstration
const mockBudgetData: BudgetData[] = [
  { category: "Food & Dining", spent: 4200, budget: 5000, color: "bg-primary" },
  { category: "Transportation", spent: 1800, budget: 2500, color: "bg-secondary" },
  { category: "Entertainment", spent: 3200, budget: 2000, color: "bg-destructive" },
  { category: "Accommodation", spent: 8000, budget: 10000, color: "bg-blue-500" },
  { category: "Books & Supplies", spent: 1500, budget: 3000, color: "bg-green-500" },
];

export default function SmartBudgetTracker() {
  const [budgetData] = useState(mockBudgetData);

  const overspendingCategories = budgetData.filter(item => item.spent > item.budget);
  const warningCategories = budgetData.filter(item => 
    item.spent / item.budget > 0.8 && item.spent <= item.budget
  );

  return (
    <Card className="bg-card" data-testid="smart-budget-tracker">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Smart Budget Tracker</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Budget Categories */}
          <div className="space-y-3">
            {budgetData.map((item, index) => {
              const percentage = (item.spent / item.budget) * 100;
              const isOverspent = item.spent > item.budget;
              
              return (
                <div key={index} data-testid={`budget-category-${item.category.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm text-foreground">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isOverspent ? 'text-destructive' : 'text-foreground'}`}>
                        KSh {item.spent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of KSh {item.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="w-full mt-1"
                    data-testid={`progress-${item.category.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Overspending Alert */}
          {overspendingCategories.length > 0 && (
            <Alert className="border-destructive/20 bg-destructive/10" data-testid="alert-overspending">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <span className="font-medium">Overspending Alert:</span> You've exceeded your budget in {overspendingCategories.length} category(ies). 
                Consider reducing discretionary spending this week.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Warning for categories near limit */}
          {warningCategories.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50" data-testid="alert-warning">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <span className="font-medium">Budget Warning:</span> You're approaching your limit in {warningCategories.length} category(ies).
              </AlertDescription>
            </Alert>
          )}
          
          {/* AI Financial Tip */}
          <Alert className="border-secondary/20 bg-secondary/10" data-testid="alert-financial-tip">
            <Lightbulb className="h-4 w-4 text-secondary" />
            <AlertDescription>
              <span className="font-medium text-secondary">AI Financial Tip:</span>
              <span className="text-muted-foreground ml-1">
                Based on your spending pattern, you could save KSh 800/month by cooking more meals at home instead of dining out.
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
