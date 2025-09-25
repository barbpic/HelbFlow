import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, GraduationCap, BookOpen, Building, MapPin } from "lucide-react";

const studentFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  course: z.string().min(1, "Course is required"),
  institution: z.string().min(1, "Institution is required"),
  region: z.string().min(1, "Region is required"),
  year: z.number().min(1).max(6),
  semester: z.number().min(1).max(2),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface Student {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
  institution: string;
  region: string;
  year: number;
  semester: number;
  accountNumber?: string;
  bankName?: string;
  createdAt: string;
}

export default function StudentProfile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      userId: "",
      studentId: "",
      firstName: "",
      lastName: "",
      course: "",
      institution: "",
      region: "",
      year: 1,
      semester: 1,
      accountNumber: "",
      bankName: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest("POST", "/api/students", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Student Created",
        description: "Student profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create student profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  const filteredStudents = students?.filter(student =>
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    form.reset({
      userId: student.userId,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      course: student.course,
      institution: student.institution,
      region: student.region,
      year: student.year,
      semester: student.semester,
      accountNumber: student.accountNumber || "",
      bankName: student.bankName || "",
    });
  };

  return (
    <div className="flex h-screen bg-background" data-testid="student-profile-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Student Profile Management</h2>
              <p className="text-sm text-muted-foreground">Register and manage student profiles and academic information</p>
            </div>
            <Button onClick={() => { setIsEditing(false); form.reset(); }} data-testid="button-new-student">
              <Plus className="h-4 w-4 mr-2" />
              New Student
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="register" className="space-y-6">
            <TabsList>
              <TabsTrigger value="register" data-testid="tab-register">Register Student</TabsTrigger>
              <TabsTrigger value="manage" data-testid="tab-manage">Manage Students</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>{isEditing ? "Edit Student Profile" : "Register New Student"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter user ID" {...field} data-testid="input-user-id" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student ID</FormLabel>
                              <FormControl>
                                <Input placeholder="ST123456" {...field} data-testid="input-student-id" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="course"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-course">
                                    <SelectValue placeholder="Select course" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="computer-science">Computer Science</SelectItem>
                                  <SelectItem value="medicine">Medicine</SelectItem>
                                  <SelectItem value="engineering">Engineering</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="law">Law</SelectItem>
                                  <SelectItem value="agriculture">Agriculture</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="institution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-institution">
                                    <SelectValue placeholder="Select institution" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="university-of-nairobi">University of Nairobi</SelectItem>
                                  <SelectItem value="kenyatta-university">Kenyatta University</SelectItem>
                                  <SelectItem value="jkuat">JKUAT</SelectItem>
                                  <SelectItem value="moi-university">Moi University</SelectItem>
                                  <SelectItem value="maseno-university">Maseno University</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-region">
                                    <SelectValue placeholder="Select region" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nairobi">Nairobi</SelectItem>
                                  <SelectItem value="mombasa">Mombasa</SelectItem>
                                  <SelectItem value="kisumu">Kisumu</SelectItem>
                                  <SelectItem value="eldoret">Eldoret</SelectItem>
                                  <SelectItem value="nakuru">Nakuru</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Year</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-year">
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Year 1</SelectItem>
                                  <SelectItem value="2">Year 2</SelectItem>
                                  <SelectItem value="3">Year 3</SelectItem>
                                  <SelectItem value="4">Year 4</SelectItem>
                                  <SelectItem value="5">Year 5</SelectItem>
                                  <SelectItem value="6">Year 6</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="semester"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Semester</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-semester">
                                    <SelectValue placeholder="Select semester" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Semester 1</SelectItem>
                                  <SelectItem value="2">Semester 2</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890" {...field} data-testid="input-account-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-bank">
                                    <SelectValue placeholder="Select bank" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kcb">KCB Bank</SelectItem>
                                  <SelectItem value="equity">Equity Bank</SelectItem>
                                  <SelectItem value="cooperative">Co-operative Bank</SelectItem>
                                  <SelectItem value="absa">Absa Bank</SelectItem>
                                  <SelectItem value="standard-chartered">Standard Chartered</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={createStudentMutation.isPending}
                        className="w-full"
                        data-testid="button-submit-student"
                      >
                        {createStudentMutation.isPending ? "Processing..." : isEditing ? "Update Student" : "Register Student"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-students"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Students Found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "No students match your search criteria." : "No students have been registered yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="hover:shadow-md transition-shadow" data-testid={`student-card-${student.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{student.studentId}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            data-testid={`button-edit-${student.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{student.course}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{student.institution}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{student.region}</span>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Badge variant="secondary">Year {student.year}</Badge>
                            <Badge variant="outline">Sem {student.semester}</Badge>
                          </div>
                          {student.bankName && (
                            <Badge className="bg-secondary/10 text-secondary">
                              {student.bankName}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
