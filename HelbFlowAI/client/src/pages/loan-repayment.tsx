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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Calculator, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  User
} from "lucide-react";
import { format, addMonths } from "date-fns";

interface Loan {
  id: string;
  studentId: string;
  totalAmount: string;
  outstandingAmount: string;
  interestRate: string;
  status: string;
  graduationDate?: string;
  repaymentStartDate?: string;
  monthlyRepayment?: string;
  createdAt: string;
}

interface Repayment {
  id: string;
  loanId: string;
  amount: string;
  paymentMethod: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
  institution: string;
}

interface RepaymentScheduleItem {
  month: number;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function LoanRepayment() {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newLoan, setNewLoan] = useState({
    totalAmount: "",
    interestRate: "",
    graduationDate: "",
  });
  const [newRepayment, setNewRepayment] = useState({
    loanId: "",
    amount: "",
    paymentMethod: "manual",
    dueDate: "",
  });
  const { toast } = useToast();

  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: loans } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const { data: currentLoan } = useQuery<Loan>({
    queryKey: ["/api/loans", selectedStudentId],
    enabled: !!selectedStudentId,
  });

  const { data: repayments } = useQuery<Repayment[]>({
    queryKey: ["/api/repayments", currentLoan?.id],
    enabled: !!currentLoan?.id,
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/loans", {
        ...data,
        studentId: selectedStudentId,
        outstandingAmount: data.totalAmount,
        status: "active",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Loan Created",
        description: "Student loan has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans", selectedStudentId] });
      setNewLoan({ totalAmount: "", interestRate: "", graduationDate: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan.",
        variant: "destructive",
      });
    },
  });

  const createRepaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/repayments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Repayment Scheduled",
        description: "Repayment has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repayments", currentLoan?.id] });
      setNewRepayment({ loanId: "", amount: "", paymentMethod: "manual", dueDate: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule repayment.",
        variant: "destructive",
      });
    },
  });

  const calculateRepaymentSchedule = (loan: Loan): RepaymentScheduleItem[] => {
    if (!loan.repaymentStartDate || !loan.monthlyRepayment) return [];

    const principal = parseFloat(loan.outstandingAmount);
    const monthlyRate = parseFloat(loan.interestRate) / 100 / 12;
    const monthlyPayment = parseFloat(loan.monthlyRepayment);
    const startDate = new Date(loan.repaymentStartDate);
    
    const schedule: RepaymentScheduleItem[] = [];
    let balance = principal;
    let month = 1;

    while (balance > 0 && month <= 120) { // Max 10 years
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      balance -= principalPayment;

      schedule.push({
        month,
        dueDate: addMonths(startDate, month - 1),
        amount: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(balance, 0),
      });

      month++;
    }

    return schedule;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-secondary/10 text-secondary";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const selectedStudent = students?.find(s => s.id === selectedStudentId);
  const repaymentSchedule = currentLoan ? calculateRepaymentSchedule(currentLoan) : [];

  return (
    <div className="flex h-screen bg-background" data-testid="loan-repayment-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Loan Repayment Management</h2>
              <p className="text-sm text-muted-foreground">Manage student loans, track repayments, and automate collections</p>
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
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="loans" data-testid="tab-loans">
                <CreditCard className="h-4 w-4 mr-2" />
                Loan Management
              </TabsTrigger>
              <TabsTrigger value="repayments" data-testid="tab-repayments">
                <Calendar className="h-4 w-4 mr-2" />
                Repayment Schedule
              </TabsTrigger>
              <TabsTrigger value="calculator" data-testid="tab-calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Repayment Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Loans</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {loans?.filter(l => l.status === "active").length || 0}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Outstanding</p>
                        <p className="text-2xl font-semibold text-foreground">
                          KSh {loans?.reduce((sum, loan) => sum + parseFloat(loan.outstandingAmount), 0).toLocaleString() || "0"}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Collections</p>
                        <p className="text-2xl font-semibold text-foreground">
                          KSh {loans?.reduce((sum, loan) => sum + (parseFloat(loan.monthlyRepayment || "0")), 0).toLocaleString() || "0"}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Collection Rate</p>
                        <p className="text-2xl font-semibold text-foreground">87.2%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Loan Details */}
              {selectedStudentId && currentLoan ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Loan Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">KSh {parseFloat(currentLoan.totalAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Outstanding:</span>
                        <span className="font-medium text-destructive">KSh {parseFloat(currentLoan.outstandingAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">{currentLoan.interestRate}% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <span className="font-medium">KSh {parseFloat(currentLoan.monthlyRepayment || "0").toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(currentLoan.status)}>
                          {currentLoan.status.charAt(0).toUpperCase() + currentLoan.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Repayment Progress */}
                      <div className="pt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span className="font-medium">
                            {(((parseFloat(currentLoan.totalAmount) - parseFloat(currentLoan.outstandingAmount)) / parseFloat(currentLoan.totalAmount)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={((parseFloat(currentLoan.totalAmount) - parseFloat(currentLoan.outstandingAmount)) / parseFloat(currentLoan.totalAmount)) * 100} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Repayments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {repayments && repayments.length > 0 ? (
                        <div className="space-y-3">
                          {repayments.slice(0, 5).map((repayment) => (
                            <div key={repayment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(repayment.status)}
                                <div>
                                  <p className="font-medium text-foreground">
                                    KSh {parseFloat(repayment.amount).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {repayment.paymentMethod.replace("_", " ")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={getStatusColor(repayment.status)}>
                                  {repayment.status}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {format(new Date(repayment.dueDate), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No repayments found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : selectedStudentId ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Loan Found</h3>
                    <p className="text-muted-foreground mb-4">This student doesn't have an active loan.</p>
                    <Button onClick={() => (document.querySelector('[data-testid="tab-loans"]') as HTMLElement)?.click()}>
                      Create Loan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Select a Student</h3>
                    <p className="text-muted-foreground">Choose a student to view their loan and repayment details.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="loans" className="space-y-6">
              {selectedStudentId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Create Loan for {selectedStudent?.firstName} {selectedStudent?.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="total-amount">Total Amount (KSh)</Label>
                        <Input
                          id="total-amount"
                          type="number"
                          placeholder="0.00"
                          value={newLoan.totalAmount}
                          onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                          data-testid="input-total-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
                        <Input
                          id="interest-rate"
                          type="number"
                          step="0.1"
                          placeholder="4.0"
                          value={newLoan.interestRate}
                          onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                          data-testid="input-interest-rate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduation-date">Expected Graduation</Label>
                        <Input
                          id="graduation-date"
                          type="date"
                          value={newLoan.graduationDate}
                          onChange={(e) => setNewLoan({ ...newLoan, graduationDate: e.target.value })}
                          data-testid="input-graduation-date"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => createLoanMutation.mutate(newLoan)}
                      disabled={createLoanMutation.isPending || !newLoan.totalAmount || !newLoan.interestRate}
                      className="w-full mt-4"
                      data-testid="button-create-loan"
                    >
                      {createLoanMutation.isPending ? "Creating..." : "Create Loan"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a student to create or manage their loan.
                  </AlertDescription>
                </Alert>
              )}

              {/* All Loans Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Student Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  {loans && loans.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Outstanding</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Interest Rate</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {loans.map((loan) => {
                            const student = students?.find(s => s.id === loan.studentId);
                            return (
                              <tr key={loan.id} data-testid={`loan-row-${loan.id}`}>
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {student?.firstName} {student?.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{student?.studentId}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium text-foreground">
                                  KSh {parseFloat(loan.totalAmount).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 font-medium text-destructive">
                                  KSh {parseFloat(loan.outstandingAmount).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 font-medium text-foreground">
                                  {loan.interestRate}%
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={getStatusColor(loan.status)}>
                                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No loans found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repayments" className="space-y-6">
              {currentLoan && repaymentSchedule.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Repayment Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Month</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Due Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Principal</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Interest</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {repaymentSchedule.slice(0, 12).map((item) => (
                            <tr key={item.month}>
                              <td className="py-3 px-4 font-medium text-foreground">{item.month}</td>
                              <td className="py-3 px-4 text-foreground">
                                {format(item.dueDate, "MMM dd, yyyy")}
                              </td>
                              <td className="py-3 px-4 font-medium text-foreground">
                                KSh {item.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                KSh {item.principal.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                KSh {item.interest.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-medium text-foreground">
                                KSh {item.balance.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No repayment schedule available. Please ensure the loan has a repayment start date and monthly payment amount set.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Repayment Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      Use this calculator to estimate monthly repayments based on loan amount, interest rate, and repayment period.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="calc-amount">Loan Amount (KSh)</Label>
                      <Input
                        id="calc-amount"
                        type="number"
                        placeholder="100000"
                        data-testid="input-calc-amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calc-rate">Interest Rate (% p.a.)</Label>
                      <Input
                        id="calc-rate"
                        type="number"
                        step="0.1"
                        placeholder="4.0"
                        data-testid="input-calc-rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calc-period">Repayment Period (years)</Label>
                      <Input
                        id="calc-period"
                        type="number"
                        placeholder="5"
                        data-testid="input-calc-period"
                      />
                    </div>
                  </div>
                  <Button className="w-full mt-4" data-testid="button-calculate-repayment">
                    Calculate Monthly Repayment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
