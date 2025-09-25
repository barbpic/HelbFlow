import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Plus, 
  AlertTriangle, 
  Lightbulb, 
  TrendingDown, 
  TrendingUp,
  ShoppingCart,
  Car,
  GamepadIcon,
  Home,
  BookOpen,
  Utensils
} from "lucide-react";

interface Transaction {
  id: string;
  studentId: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  merchantName?: string;
  isAutoCategorized: boolean;
}

interface Budget {
  id: string;
  studentId: string;
  category: string;
  budgetAmount: string;
  spentAmount: string;
  month: number;
  year: number;
  alertThreshold: string;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

export default function BudgetTracker() {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    category: "",
    description: "",
    merchantName: "",
  });
  const [newBudget, setNewBudget] = useState({
    category: "",
    budgetAmount: "",
    alertThreshold: "80",
  });
  const { toast } = useToast();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", selectedStudentId],
    enabled: !!selectedStudentId,
  });

  const { data: budgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets", selectedStudentId, "month", currentYear, currentMonth],
    enabled: !!selectedStudentId,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/transactions", {
        ...data,
        studentId: selectedStudentId,
        amount: data.amount,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Added",
        description: "Transaction has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", selectedStudentId] });
      setNewTransaction({ amount: "", category: "", description: "", merchantName: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction.",
        variant: "destructive",
      });
    },
  });

  const addBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/budgets", {
        ...data,
        studentId: selectedStudentId,
        month: currentMonth,
        year: currentYear,
        spentAmount: "0",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget Created",
        description: "Budget has been set successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets", selectedStudentId, "month", currentYear, currentMonth] });
      setNewBudget({ category: "", budgetAmount: "", alertThreshold: "80" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget.",
        variant: "destructive",
      });
    },
  });

  const analyzeBudgetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/budgets/analyze/${selectedStudentId}`);
      return response.json();
    },
    onSuccess: (advice) => {
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${advice.length} financial recommendations.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze budget.",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return <Utensils className="h-4 w-4" />;
      case "transport":
        return <Car className="h-4 w-4" />;
      case "entertainment":
        return <GamepadIcon className="h-4 w-4" />;
      case "accommodation":
        return <Home className="h-4 w-4" />;
      case "books":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return "bg-blue-500";
      case "transport":
        return "bg-green-500";
      case "entertainment":
        return "bg-purple-500";
      case "accommodation":
        return "bg-orange-500";
      case "books":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateSpentByCategory = (category: string) => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const selectedStudent = students?.find(s => s.id === selectedStudentId);

  return (
    <div className="flex h-screen bg-background" data-testid="budget-tracker-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Smart Budget Tracker</h2>
              <p className="text-sm text-muted-foreground">Track expenses, manage budgets, and get AI-powered financial insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-64" data-testid="select-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {!selectedStudentId ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Student</h3>
                <p className="text-muted-foreground">Choose a student to view their budget and transaction data.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview" data-testid="tab-overview">
                  <Wallet className="h-4 w-4 mr-2" />
                  Budget Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" data-testid="tab-transactions">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </TabsTrigger>
                <TabsTrigger value="budgets" data-testid="tab-budgets">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Manage Budgets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    Budget Overview for {selectedStudent?.firstName} {selectedStudent?.lastName}
                  </h3>
                  <Button 
                    onClick={() => analyzeBudgetMutation.mutate()}
                    disabled={analyzeBudgetMutation.isPending}
                    data-testid="button-analyze"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {analyzeBudgetMutation.isPending ? "Analyzing..." : "Get AI Analysis"}
                  </Button>
                </div>

                {budgets && budgets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                      const spent = calculateSpentByCategory(budget.category);
                      const budgetAmount = parseFloat(budget.budgetAmount);
                      const percentage = (spent / budgetAmount) * 100;
                      const isOverspent = spent > budgetAmount;
                      const isNearLimit = percentage > parseFloat(budget.alertThreshold) && !isOverspent;

                      return (
                        <Card key={budget.id} className={isOverspent ? "border-destructive" : isNearLimit ? "border-orange-500" : ""} data-testid={`budget-${budget.category}`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${getCategoryColor(budget.category)} rounded-lg flex items-center justify-center text-white`}>
                                  {getCategoryIcon(budget.category)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground capitalize">{budget.category}</h4>
                                  <p className="text-sm text-muted-foreground">Monthly Budget</p>
                                </div>
                              </div>
                              {isOverspent && <Badge variant="destructive">Overspent</Badge>}
                              {isNearLimit && <Badge variant="outline" className="border-orange-500 text-orange-600">Near Limit</Badge>}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Spent</span>
                                <span className={`font-medium ${isOverspent ? 'text-destructive' : 'text-foreground'}`}>
                                  KSh {spent.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Budget</span>
                                <span className="font-medium text-foreground">
                                  KSh {budgetAmount.toLocaleString()}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(percentage, 100)} 
                                className={`w-full ${isOverspent ? 'bg-destructive/20' : isNearLimit ? 'bg-orange-100' : ''}`}
                              />
                              <div className="text-xs text-muted-foreground text-center">
                                {percentage.toFixed(1)}% used
                              </div>
                            </div>

                            {isOverspent && (
                              <Alert className="mt-4 border-destructive/20 bg-destructive/10">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-destructive text-xs">
                                  Exceeded budget by KSh {(spent - budgetAmount).toLocaleString()}
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Budgets Set</h3>
                      <p className="text-muted-foreground mb-4">Create budgets to start tracking expenses for this student.</p>
                      <Button onClick={() => (document.querySelector('[data-testid="tab-budgets"]') as HTMLElement)?.click()}>
                        Create Budget
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Transactions */}
                {transactions && transactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg" data-testid={`transaction-${transaction.id}`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${getCategoryColor(transaction.category)} rounded-full flex items-center justify-center text-white`}>
                                {getCategoryIcon(transaction.category)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {transaction.category} 
                                  {transaction.merchantName && ` • ${transaction.merchantName}`}
                                  {transaction.isAutoCategorized && <Badge variant="outline" className="ml-2 text-xs">AI Categorized</Badge>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                KSh {parseFloat(transaction.amount).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount (KSh)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                          data-testid="input-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food">Food & Dining</SelectItem>
                            <SelectItem value="transport">Transportation</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="books">Books & Supplies</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Transaction description"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                          data-testid="input-description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="merchant">Merchant (Optional)</Label>
                        <Input
                          id="merchant"
                          placeholder="Store or service name"
                          value={newTransaction.merchantName}
                          onChange={(e) => setNewTransaction({ ...newTransaction, merchantName: e.target.value })}
                          data-testid="input-merchant"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => addTransactionMutation.mutate(newTransaction)}
                      disabled={addTransactionMutation.isPending || !newTransaction.amount || !newTransaction.category || !newTransaction.description}
                      className="w-full mt-4"
                      data-testid="button-add-transaction"
                    >
                      {addTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budgets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="budget-category">Category</Label>
                        <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                          <SelectTrigger data-testid="select-budget-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food">Food & Dining</SelectItem>
                            <SelectItem value="transport">Transportation</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="books">Books & Supplies</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget-amount">Monthly Budget (KSh)</Label>
                        <Input
                          id="budget-amount"
                          type="number"
                          placeholder="0.00"
                          value={newBudget.budgetAmount}
                          onChange={(e) => setNewBudget({ ...newBudget, budgetAmount: e.target.value })}
                          data-testid="input-budget-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                        <Input
                          id="alert-threshold"
                          type="number"
                          placeholder="80"
                          value={newBudget.alertThreshold}
                          onChange={(e) => setNewBudget({ ...newBudget, alertThreshold: e.target.value })}
                          data-testid="input-alert-threshold"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => addBudgetMutation.mutate(newBudget)}
                      disabled={addBudgetMutation.isPending || !newBudget.category || !newBudget.budgetAmount}
                      className="w-full mt-4"
                      data-testid="button-create-budget"
                    >
                      {addBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                    </Button>
                  </CardContent>
                </Card>

                {budgets && budgets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Month Budgets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {budgets.map((budget) => (
                          <div key={budget.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${getCategoryColor(budget.category)} rounded-lg flex items-center justify-center text-white`}>
                                {getCategoryIcon(budget.category)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground capitalize">{budget.category}</p>
                                <p className="text-sm text-muted-foreground">Alert at {budget.alertThreshold}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                KSh {parseFloat(budget.budgetAmount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">Monthly Budget</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
