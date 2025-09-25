import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Calculator, TrendingUp, Calendar, DollarSign, BookOpen, Home, Users } from "lucide-react";
import { format } from "date-fns";

interface DisbursementCalculation {
  tuition: number;
  upkeep: number;
  books: number;
  supplies: number;
  total: number;
  reasoning: string;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
  institution: string;
  region: string;
  year: number;
  semester: number;
}

interface Disbursement {
  id: string;
  studentId: string;
  type: string;
  amount: string;
  status: string;
  recipient: string;
  createdAt: string;
  student: Student;
}

export default function AIDisbursement() {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [region, setRegion] = useState("");
  const [calculation, setCalculation] = useState<DisbursementCalculation | null>(null);
  const { toast } = useToast();

  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: disbursements, isLoading: disbursementsLoading } = useQuery<Disbursement[]>({
    queryKey: ["/api/disbursements"],
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/disbursements/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculation(data);
      toast({
        title: "AI Calculation Complete",
        description: "Optimal disbursement amounts calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate disbursement.",
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      if (!calculation || !selectedStudentId) throw new Error("Missing required data");
      
      const disbursements = [
        {
          studentId: selectedStudentId,
          type: "tuition",
          amount: calculation.tuition.toString(),
          recipient: "university",
          aiRecommendation: { reasoning: calculation.reasoning },
        },
        {
          studentId: selectedStudentId,
          type: "upkeep",
          amount: calculation.upkeep.toString(),
          recipient: "student",
          aiRecommendation: { reasoning: calculation.reasoning },
        },
        {
          studentId: selectedStudentId,
          type: "books",
          amount: calculation.books.toString(),
          recipient: "student",
          aiRecommendation: { reasoning: calculation.reasoning },
        },
      ];

      const promises = disbursements.map(disbursement =>
        apiRequest("POST", "/api/disbursements", disbursement).then(res => res.json())
      );

      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Disbursement Processed",
        description: "All disbursements have been successfully processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/disbursements"] });
      // Reset form
      setSelectedStudentId("");
      setCourse("");
      setInstitution("");
      setRegion("");
      setCalculation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process disbursement.",
        variant: "destructive",
      });
    },
  });

  const handleStudentSelect = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentId(studentId);
      setCourse(student.course);
      setInstitution(student.institution);
      setRegion(student.region);
    }
  };

  const handleCalculate = () => {
    if (!selectedStudentId || !course || !institution || !region) {
      toast({
        title: "Missing Information",
        description: "Please select a student and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate({
      studentId: selectedStudentId,
      course,
      institution,
      region,
      year: new Date().getFullYear(),
      semester: 1,
    });
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tuition":
        return <BookOpen className="h-4 w-4" />;
      case "upkeep":
        return <Home className="h-4 w-4" />;
      case "books":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-background" data-testid="ai-disbursement-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">AI-Powered Disbursement Calculator</h2>
              <p className="text-sm text-muted-foreground">Optimize loan disbursements using artificial intelligence and regional data</p>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">AI Powered</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="calculator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="calculator" data-testid="tab-calculator">
                <Calculator className="h-4 w-4 mr-2" />
                AI Calculator
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <TrendingUp className="h-4 w-4 mr-2" />
                Disbursement History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span>Smart Disbursement Calculator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="student-select">Select Student</Label>
                      <Select value={selectedStudentId} onValueChange={handleStudentSelect}>
                        <SelectTrigger data-testid="select-student">
                          <SelectValue placeholder="Choose a student" />
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course">Course Type</Label>
                        <Select value={course} onValueChange={setCourse}>
                          <SelectTrigger data-testid="select-course">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="law">Law</SelectItem>
                            <SelectItem value="agriculture">Agriculture</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="institution">Institution</Label>
                        <Select value={institution} onValueChange={setInstitution}>
                          <SelectTrigger data-testid="select-institution">
                            <SelectValue placeholder="Select institution" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="university-of-nairobi">University of Nairobi</SelectItem>
                            <SelectItem value="kenyatta-university">Kenyatta University</SelectItem>
                            <SelectItem value="jkuat">JKUAT</SelectItem>
                            <SelectItem value="moi-university">Moi University</SelectItem>
                            <SelectItem value="maseno-university">Maseno University</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger data-testid="select-region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nairobi">Nairobi</SelectItem>
                          <SelectItem value="mombasa">Mombasa</SelectItem>
                          <SelectItem value="kisumu">Kisumu</SelectItem>
                          <SelectItem value="eldoret">Eldoret</SelectItem>
                          <SelectItem value="nakuru">Nakuru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        The AI will analyze course requirements, regional cost variations, and institutional fee structures to provide optimal disbursement recommendations.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleCalculate}
                      disabled={calculateMutation.isPending}
                      className="w-full"
                      data-testid="button-calculate"
                    >
                      {calculateMutation.isPending ? "Calculating..." : "Calculate AI Recommendation"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {calculation ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/10 rounded-lg p-4 text-center">
                            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Tuition</p>
                            <p className="text-xl font-semibold text-foreground" data-testid="value-tuition">
                              KSh {calculation.tuition.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-secondary/10 rounded-lg p-4 text-center">
                            <Home className="h-6 w-6 text-secondary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Monthly Upkeep</p>
                            <p className="text-xl font-semibold text-foreground" data-testid="value-upkeep">
                              KSh {calculation.upkeep.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-accent rounded-lg p-4 text-center">
                            <BookOpen className="h-6 w-6 text-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Books & Supplies</p>
                            <p className="text-xl font-semibold text-foreground" data-testid="value-books">
                              KSh {calculation.books.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-primary rounded-lg p-4 text-center">
                            <DollarSign className="h-6 w-6 text-primary-foreground mx-auto mb-2" />
                            <p className="text-sm text-primary-foreground">Total Amount</p>
                            <p className="text-xl font-semibold text-primary-foreground" data-testid="value-total">
                              KSh {calculation.total.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="bg-muted rounded-lg p-4">
                          <h4 className="font-medium text-foreground mb-2">AI Reasoning</h4>
                          <p className="text-sm text-muted-foreground">{calculation.reasoning}</p>
                        </div>

                        <Button 
                          onClick={() => processMutation.mutate()}
                          disabled={processMutation.isPending}
                          className="w-full"
                          data-testid="button-process"
                        >
                          {processMutation.isPending ? "Processing..." : "Process Disbursement"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Calculate disbursement to see AI recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Disbursements</span>
                    <Badge variant="secondary">{disbursements?.length || 0} Total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {disbursementsLoading ? (
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
                  ) : disbursements && disbursements.length > 0 ? (
                    <div className="space-y-4">
                      {disbursements.map((disbursement) => (
                        <div key={disbursement.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`disbursement-${disbursement.id}`}>
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                              {getTypeIcon(disbursement.type)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {disbursement.student.firstName} {disbursement.student.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {disbursement.student.studentId} • {disbursement.type.charAt(0).toUpperCase() + disbursement.type.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              KSh {parseFloat(disbursement.amount).toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(disbursement.status)}>
                                {disbursement.status.charAt(0).toUpperCase() + disbursement.status.slice(1)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(disbursement.createdAt), "MMM dd")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No disbursements found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
