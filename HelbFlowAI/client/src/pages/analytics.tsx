import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Download, 
  Filter,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  Users,
  CreditCard,
  Building,
  AlertCircle
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  disbursementTrends: Array<{
    month: string;
    tuition: number;
    upkeep: number;
    books: number;
    total: number;
  }>;
  budgetAnalysis: Array<{
    category: string;
    budgeted: number;
    spent: number;
    variance: number;
  }>;
  repaymentPerformance: Array<{
    month: string;
    expected: number;
    collected: number;
    rate: number;
  }>;
  studentDistribution: Array<{
    institution: string;
    count: number;
    amount: number;
  }>;
  bankPerformance: Array<{
    bank: string;
    transactions: number;
    success_rate: number;
    avg_response_time: number;
  }>;
}

const COLORS = ['hsl(214, 92%, 48%)', 'hsl(157, 64%, 39%)', 'hsl(42, 93%, 56%)', 'hsl(0, 84%, 60%)', 'hsl(271, 91%, 65%)'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState("disbursements");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedBank, setSelectedBank] = useState("all");

  // Mock data - in real implementation, this would come from API
  const mockAnalyticsData: AnalyticsData = {
    disbursementTrends: [
      { month: "Jun", tuition: 85000000, upkeep: 45000000, books: 12000000, total: 142000000 },
      { month: "Jul", tuition: 92000000, upkeep: 48000000, books: 15000000, total: 155000000 },
      { month: "Aug", tuition: 88000000, upkeep: 52000000, books: 18000000, total: 158000000 },
      { month: "Sep", tuition: 95000000, upkeep: 55000000, books: 16000000, total: 166000000 },
      { month: "Oct", tuition: 89000000, upkeep: 49000000, books: 14000000, total: 152000000 },
      { month: "Nov", tuition: 98000000, upkeep: 58000000, books: 20000000, total: 176000000 },
    ],
    budgetAnalysis: [
      { category: "Food", budgeted: 5000, spent: 4200, variance: -800 },
      { category: "Transport", budgeted: 2500, spent: 1800, variance: -700 },
      { category: "Entertainment", budgeted: 2000, spent: 3200, variance: 1200 },
      { category: "Accommodation", budgeted: 10000, spent: 8000, variance: -2000 },
      { category: "Books", budgeted: 3000, spent: 1500, variance: -1500 },
    ],
    repaymentPerformance: [
      { month: "Jun", expected: 45000000, collected: 39000000, rate: 86.7 },
      { month: "Jul", expected: 47000000, collected: 41000000, rate: 87.2 },
      { month: "Aug", expected: 48000000, collected: 42000000, rate: 87.5 },
      { month: "Sep", expected: 50000000, collected: 44000000, rate: 88.0 },
      { month: "Oct", expected: 52000000, collected: 45000000, rate: 86.5 },
      { month: "Nov", expected: 54000000, collected: 47000000, rate: 87.0 },
    ],
    studentDistribution: [
      { institution: "University of Nairobi", count: 3245, amount: 425000000 },
      { institution: "Kenyatta University", count: 2156, amount: 298000000 },
      { institution: "JKUAT", count: 1847, amount: 256000000 },
      { institution: "Moi University", count: 1634, amount: 198000000 },
      { institution: "Maseno University", count: 1289, amount: 167000000 },
    ],
    bankPerformance: [
      { bank: "KCB Bank", transactions: 15234, success_rate: 98.2, avg_response_time: 245 },
      { bank: "Equity Bank", transactions: 12456, success_rate: 97.8, avg_response_time: 189 },
      { bank: "Co-operative Bank", transactions: 8934, success_rate: 96.5, avg_response_time: 312 },
      { bank: "Absa Bank", transactions: 6782, success_rate: 95.1, avg_response_time: 456 },
    ],
  };

  const formatCurrency = (value: number) => {
    return `KSh ${(value / 1000000).toFixed(1)}M`;
  };

  const exportReport = () => {
    // In real implementation, this would generate and download a report
    console.log("Exporting analytics report...");
  };

  return (
    <div className="flex h-screen bg-background" data-testid="analytics-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Analytics & Reporting</h2>
              <p className="text-sm text-muted-foreground">Comprehensive insights into disbursements, budgets, and system performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-60 justify-start text-left font-normal" data-testid="button-date-range">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={exportReport} data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="disbursements" data-testid="tab-disbursements">
                <DollarSign className="h-4 w-4 mr-2" />
                Disbursements
              </TabsTrigger>
              <TabsTrigger value="budgets" data-testid="tab-budgets">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Budget Analysis
              </TabsTrigger>
              <TabsTrigger value="repayments" data-testid="tab-repayments">
                <TrendingUp className="h-4 w-4 mr-2" />
                Repayments
              </TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">
                <Activity className="h-4 w-4 mr-2" />
                System Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Disbursed</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {formatCurrency(mockAnalyticsData.disbursementTrends.reduce((sum, item) => sum + item.total, 0))}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-secondary/10 text-secondary">+12.3% vs last period</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {mockAnalyticsData.studentDistribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-secondary/10 text-secondary">+2.5% vs last period</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Repayment Rate</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {mockAnalyticsData.repaymentPerformance[mockAnalyticsData.repaymentPerformance.length - 1]?.rate.toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-secondary/10 text-secondary">+0.8% vs last period</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">System Uptime</p>
                        <p className="text-2xl font-semibold text-foreground">99.8%</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-secondary/10 text-secondary">Excellent</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disbursement Trends (6 Months)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockAnalyticsData.disbursementTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="hsl(214, 92%, 48%)" 
                          fill="hsl(214, 92%, 48%)" 
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Distribution by Institution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mockAnalyticsData.studentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {mockAnalyticsData.studentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="disbursements" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Disbursement Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                        <SelectTrigger data-testid="select-institution">
                          <SelectValue placeholder="All Institutions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Institutions</SelectItem>
                          <SelectItem value="university-of-nairobi">University of Nairobi</SelectItem>
                          <SelectItem value="kenyatta-university">Kenyatta University</SelectItem>
                          <SelectItem value="jkuat">JKUAT</SelectItem>
                          <SelectItem value="moi-university">Moi University</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="disbursement-type">Disbursement Type</Label>
                      <Select>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="tuition">Tuition</SelectItem>
                          <SelectItem value="upkeep">Upkeep</SelectItem>
                          <SelectItem value="books">Books & Supplies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disbursement Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disbursement Breakdown by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mockAnalyticsData.disbursementTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="tuition" stackId="a" fill="hsl(214, 92%, 48%)" name="Tuition" />
                        <Bar dataKey="upkeep" stackId="a" fill="hsl(157, 64%, 39%)" name="Upkeep" />
                        <Bar dataKey="books" stackId="a" fill="hsl(42, 93%, 56%)" name="Books" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Institution-wise Disbursements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mockAnalyticsData.studentDistribution} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis dataKey="institution" type="category" width={120} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="amount" fill="hsl(214, 92%, 48%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="budgets" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs Actual Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={mockAnalyticsData.budgetAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="budgeted" fill="hsl(214, 92%, 48%)" name="Budgeted" />
                        <Bar dataKey="spent" fill="hsl(157, 64%, 39%)" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Variance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalyticsData.budgetAnalysis.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{item.category}</p>
                            <p className="text-sm text-muted-foreground">
                              Budgeted: KSh {item.budgeted.toLocaleString()} | Spent: KSh {item.spent.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={item.variance > 0 ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}
                              data-testid={`variance-${item.category.toLowerCase()}`}
                            >
                              {item.variance > 0 ? "+" : ""}KSh {Math.abs(item.variance).toLocaleString()}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.variance > 0 ? "Over budget" : "Under budget"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="repayments" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Repayment Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={mockAnalyticsData.repaymentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                        <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="expected" fill="hsl(214, 92%, 48%)" name="Expected" />
                        <Bar yAxisId="left" dataKey="collected" fill="hsl(157, 64%, 39%)" name="Collected" />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="hsl(0, 84%, 60%)" 
                          strokeWidth={3}
                          name="Collection Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Repayment Method Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-2xl font-bold text-foreground">64%</p>
                          <p className="text-sm text-muted-foreground">Standing Orders</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-2xl font-bold text-foreground">22%</p>
                          <p className="text-sm text-muted-foreground">Payroll Deductions</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="text-2xl font-bold text-foreground">14%</p>
                          <p className="text-sm text-muted-foreground">Manual Payments</p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h4 className="font-medium text-foreground mb-3">Collection Efficiency</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Standing Orders</span>
                            <span className="font-medium">98.5%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payroll Deductions</span>
                            <span className="font-medium">95.2%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Manual Payments</span>
                            <span className="font-medium">67.8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Integration Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalyticsData.bankPerformance.map((bank, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{bank.bank}</h4>
                            <Badge className="bg-secondary/10 text-secondary">
                              {bank.success_rate.toFixed(1)}% Success
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Transactions</p>
                              <p className="font-medium">{bank.transactions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Response</p>
                              <p className="font-medium">{bank.avg_response_time}ms</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">API Response Time</span>
                          <span className="font-medium">542ms avg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-secondary h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Database Performance</span>
                          <span className="font-medium">98.2% optimal</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-secondary h-2 rounded-full" style={{ width: "98%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Error Rate</span>
                          <span className="font-medium">0.8%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "99%" }}></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h4 className="font-medium text-foreground mb-3">Recent Alerts</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-muted-foreground">High API latency detected - Absa Bank</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-muted-foreground">All systems operational</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
