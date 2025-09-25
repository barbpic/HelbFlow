import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DisbursementCalculation {
  tuition: number;
  upkeep: number;
  books: number;
  supplies: number;
  total: number;
  reasoning: string;
}

export default function AIDisbursementCalculator() {
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [region, setRegion] = useState("");
  const [calculation, setCalculation] = useState<DisbursementCalculation | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/disbursements/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCalculation(data);
      toast({
        title: "Calculation Complete",
        description: "AI disbursement recommendation generated successfully.",
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

  const processDisbursementMutation = useMutation({
    mutationFn: async () => {
      if (!calculation || !studentId) throw new Error("Missing required data");
      
      const disbursements = [
        {
          studentId,
          type: "tuition",
          amount: calculation.tuition.toString(),
          recipient: "university",
          aiRecommendation: { reasoning: calculation.reasoning },
        },
        {
          studentId,
          type: "upkeep",
          amount: calculation.upkeep.toString(),
          recipient: "student",
          aiRecommendation: { reasoning: calculation.reasoning },
        },
        {
          studentId,
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
      // Reset form
      setStudentId("");
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

  const handleCalculate = () => {
    if (!studentId || !course || !institution || !region) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate({
      studentId,
      course,
      institution,
      region,
      year: new Date().getFullYear(),
      semester: 1,
    });
  };

  return (
    <Card className="bg-card" data-testid="ai-disbursement-calculator">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Disbursement Calculator</span>
          <Bot className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                placeholder="ST123456"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                data-testid="input-student-id"
              />
            </div>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={calculateMutation.isPending}
            className="w-full"
            data-testid="button-calculate"
          >
            {calculateMutation.isPending ? "Calculating..." : "Calculate AI Recommendation"}
          </Button>
          
          {calculation && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">AI Recommendations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition (Semester 1):</span>
                  <span className="font-medium text-foreground" data-testid="value-tuition">
                    KSh {calculation.tuition.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Upkeep:</span>
                  <span className="font-medium text-foreground" data-testid="value-upkeep">
                    KSh {calculation.upkeep.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Books & Supplies:</span>
                  <span className="font-medium text-foreground" data-testid="value-books">
                    KSh {calculation.books.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total Disbursement:</span>
                  <span className="text-primary" data-testid="value-total">
                    KSh {calculation.total.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={() => processDisbursementMutation.mutate()}
                disabled={processDisbursementMutation.isPending}
                className="w-full mt-4"
                data-testid="button-process-disbursement"
              >
                {processDisbursementMutation.isPending ? "Processing..." : "Process Disbursement"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
