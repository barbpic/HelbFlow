import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiAdvisor } from "./services/openai";
import { 
  insertStudentSchema, insertDisbursementSchema, insertTransactionSchema,
  insertBudgetSchema, insertLoanSchema, insertRepaymentSchema, insertAiAdviceSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [totalStudents, totalActiveLoans, monthlyDisbursements, repaymentRate] = await Promise.all([
        storage.getTotalStudentsCount(),
        storage.getTotalActiveLoansAmount(),
        storage.getMonthlyDisbursementsAmount(),
        storage.getRepaymentRate()
      ]);

      res.json({
        totalStudents,
        totalActiveLoans,
        monthlyDisbursements,
        repaymentRate: repaymentRate.toFixed(1)
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching dashboard stats: " + error.message });
    }
  });

  // Students
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating student: " + error.message });
    }
  });

  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching students: " + error.message });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching student: " + error.message });
    }
  });

  app.get("/api/students/by-student-id/:studentId", async (req, res) => {
    try {
      const student = await storage.getStudentByStudentId(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching student: " + error.message });
    }
  });

  // AI Disbursement Calculator
  app.post("/api/disbursements/calculate", async (req, res) => {
    try {
      const { studentId, course, institution, region, year, semester } = req.body;
      
      const calculation = await aiAdvisor.calculateOptimalDisbursement({
        course,
        institution,
        region,
        year,
        semester
      });

      res.json(calculation);
    } catch (error: any) {
      res.status(500).json({ message: "Error calculating disbursement: " + error.message });
    }
  });

  app.post("/api/disbursements", async (req, res) => {
    try {
      const validatedData = insertDisbursementSchema.parse(req.body);
      const disbursement = await storage.createDisbursement(validatedData);
      res.json(disbursement);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating disbursement: " + error.message });
    }
  });

  app.get("/api/disbursements", async (req, res) => {
    try {
      const { studentId } = req.query;
      const disbursements = await storage.getDisbursements(studentId as string);
      res.json(disbursements);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching disbursements: " + error.message });
    }
  });

  app.get("/api/disbursements/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const disbursements = await storage.getRecentDisbursements(limit);
      res.json(disbursements);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recent disbursements: " + error.message });
    }
  });

  app.patch("/api/disbursements/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const processedAt = status === "completed" ? new Date() : undefined;
      const disbursement = await storage.updateDisbursementStatus(req.params.id, status, processedAt);
      res.json(disbursement);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating disbursement status: " + error.message });
    }
  });

  // Transactions
  app.post("/api/transactions", async (req, res) => {
    try {
      let validatedData = insertTransactionSchema.parse(req.body);
      
      // Auto-categorize if not provided
      if (!validatedData.category) {
        validatedData.category = await aiAdvisor.categorizeTransaction(
          validatedData.description || "",
          validatedData.merchantName || undefined
        );
        validatedData.isAutoCategorized = true;
      }

      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating transaction: " + error.message });
    }
  });

  app.get("/api/transactions/:studentId", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.params.studentId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching transactions: " + error.message });
    }
  });

  app.get("/api/transactions/:studentId/month/:year/:month", async (req, res) => {
    try {
      const { studentId, year, month } = req.params;
      const transactions = await storage.getTransactionsForMonth(
        studentId, 
        parseInt(year), 
        parseInt(month)
      );
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching monthly transactions: " + error.message });
    }
  });

  // Budgets
  app.post("/api/budgets", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      res.json(budget);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating budget: " + error.message });
    }
  });

  app.get("/api/budgets/:studentId", async (req, res) => {
    try {
      const budgets = await storage.getBudgets(req.params.studentId);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching budgets: " + error.message });
    }
  });

  app.get("/api/budgets/:studentId/month/:year/:month", async (req, res) => {
    try {
      const { studentId, year, month } = req.params;
      const budgets = await storage.getBudgetForMonth(
        studentId,
        parseInt(year),
        parseInt(month)
      );
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching monthly budgets: " + error.message });
    }
  });

  // AI Budget Analysis
  app.post("/api/budgets/analyze/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [transactions, budgets] = await Promise.all([
        storage.getTransactionsForMonth(studentId, year, month),
        storage.getBudgetForMonth(studentId, year, month)
      ]);

      const advice = await aiAdvisor.analyzeBudgetAndProvideAdvice({
        studentId,
        spending: transactions,
        budgets,
        monthlyIncome: 15000 // Default student allowance
      });

      // Store AI advice in database
      for (const adviceItem of advice) {
        await storage.createAiAdvice({
          studentId,
          type: adviceItem.type,
          message: adviceItem.message,
          category: adviceItem.category
        });
      }

      res.json(advice);
    } catch (error: any) {
      res.status(500).json({ message: "Error analyzing budget: " + error.message });
    }
  });

  // Loans
  app.post("/api/loans", async (req, res) => {
    try {
      const validatedData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(validatedData);
      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating loan: " + error.message });
    }
  });

  app.get("/api/loans/:studentId", async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.studentId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching loan: " + error.message });
    }
  });

  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getAllActiveLoans();
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching loans: " + error.message });
    }
  });

  // Repayments
  app.post("/api/repayments", async (req, res) => {
    try {
      const validatedData = insertRepaymentSchema.parse(req.body);
      const repayment = await storage.createRepayment(validatedData);
      res.json(repayment);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating repayment: " + error.message });
    }
  });

  app.get("/api/repayments/:loanId", async (req, res) => {
    try {
      const repayments = await storage.getRepayments(req.params.loanId);
      res.json(repayments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching repayments: " + error.message });
    }
  });

  app.get("/api/repayments/upcoming/all", async (req, res) => {
    try {
      const upcomingRepayments = await storage.getUpcomingRepayments();
      res.json(upcomingRepayments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching upcoming repayments: " + error.message });
    }
  });

  // AI Advice
  app.get("/api/ai-advice/:studentId", async (req, res) => {
    try {
      const advice = await storage.getAiAdvice(req.params.studentId);
      res.json(advice);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching AI advice: " + error.message });
    }
  });

  app.patch("/api/ai-advice/:id/read", async (req, res) => {
    try {
      const advice = await storage.markAdviceAsRead(req.params.id);
      res.json(advice);
    } catch (error: any) {
      res.status(400).json({ message: "Error marking advice as read: " + error.message });
    }
  });

  // Generate financial tip
  app.post("/api/ai-advice/generate-tip/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const transactions = await storage.getTransactions(studentId);
      
      const tip = await aiAdvisor.generateFinancialTip(transactions);
      
      const advice = await storage.createAiAdvice({
        studentId,
        type: "financial_tip",
        message: tip,
      });

      res.json(advice);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating financial tip: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
