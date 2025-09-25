import { 
  users, students, disbursements, transactions, budgets, loans, repayments, aiAdvice,
  type User, type InsertUser, type Student, type InsertStudent, 
  type Disbursement, type InsertDisbursement, type Transaction, type InsertTransaction,
  type Budget, type InsertBudget, type Loan, type InsertLoan,
  type Repayment, type InsertRepayment, type AiAdvice, type InsertAiAdvice
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
  getAllStudents(): Promise<Student[]>;

  // Disbursements
  createDisbursement(disbursement: InsertDisbursement): Promise<Disbursement>;
  getDisbursements(studentId?: string): Promise<Disbursement[]>;
  updateDisbursementStatus(id: string, status: string, processedAt?: Date): Promise<Disbursement>;
  getRecentDisbursements(limit?: number): Promise<(Disbursement & { student: Student })[]>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(studentId: string): Promise<Transaction[]>;
  getTransactionsByCategory(studentId: string, category: string): Promise<Transaction[]>;
  getTransactionsForMonth(studentId: string, year: number, month: number): Promise<Transaction[]>;

  // Budgets
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(studentId: string): Promise<Budget[]>;
  getBudgetForMonth(studentId: string, year: number, month: number): Promise<Budget[]>;
  updateBudgetSpent(id: string, spentAmount: string): Promise<Budget>;

  // Loans
  createLoan(loan: InsertLoan): Promise<Loan>;
  getLoan(studentId: string): Promise<Loan | undefined>;
  updateLoan(id: string, updates: Partial<Loan>): Promise<Loan>;
  getAllActiveLoans(): Promise<Loan[]>;

  // Repayments
  createRepayment(repayment: InsertRepayment): Promise<Repayment>;
  getRepayments(loanId: string): Promise<Repayment[]>;
  updateRepaymentStatus(id: string, status: string, paidDate?: Date): Promise<Repayment>;
  getUpcomingRepayments(): Promise<(Repayment & { loan: Loan & { student: Student } })[]>;

  // AI Advice
  createAiAdvice(advice: InsertAiAdvice): Promise<AiAdvice>;
  getAiAdvice(studentId: string): Promise<AiAdvice[]>;
  markAdviceAsRead(id: string): Promise<AiAdvice>;

  // Statistics
  getTotalStudentsCount(): Promise<number>;
  getTotalActiveLoansAmount(): Promise<string>;
  getMonthlyDisbursementsAmount(): Promise<string>;
  getRepaymentRate(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const [student] = await db.update(students).set(updates).where(eq(students.id, id)).returning();
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async createDisbursement(insertDisbursement: InsertDisbursement): Promise<Disbursement> {
    const [disbursement] = await db.insert(disbursements).values(insertDisbursement).returning();
    return disbursement;
  }

  async getDisbursements(studentId?: string): Promise<Disbursement[]> {
    if (studentId) {
      return await db.select().from(disbursements)
        .where(eq(disbursements.studentId, studentId))
        .orderBy(desc(disbursements.createdAt));
    }
    return await db.select().from(disbursements).orderBy(desc(disbursements.createdAt));
  }

  async updateDisbursementStatus(id: string, status: string, processedAt?: Date): Promise<Disbursement> {
    const updates: any = { status };
    if (processedAt) updates.processedAt = processedAt;
    
    const [disbursement] = await db.update(disbursements)
      .set(updates)
      .where(eq(disbursements.id, id))
      .returning();
    return disbursement;
  }

  async getRecentDisbursements(limit = 10): Promise<(Disbursement & { student: Student })[]> {
    return await db.select({
      id: disbursements.id,
      studentId: disbursements.studentId,
      type: disbursements.type,
      amount: disbursements.amount,
      status: disbursements.status,
      recipient: disbursements.recipient,
      aiRecommendation: disbursements.aiRecommendation,
      processedAt: disbursements.processedAt,
      createdAt: disbursements.createdAt,
      student: students,
    })
    .from(disbursements)
    .innerJoin(students, eq(disbursements.studentId, students.id))
    .orderBy(desc(disbursements.createdAt))
    .limit(limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getTransactions(studentId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.studentId, studentId))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByCategory(studentId: string, category: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(eq(transactions.studentId, studentId), eq(transactions.category, category)))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsForMonth(studentId: string, year: number, month: number): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await db.select().from(transactions)
      .where(and(
        eq(transactions.studentId, studentId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ))
      .orderBy(desc(transactions.date));
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }

  async getBudgets(studentId: string): Promise<Budget[]> {
    return await db.select().from(budgets)
      .where(eq(budgets.studentId, studentId))
      .orderBy(desc(budgets.year), desc(budgets.month));
  }

  async getBudgetForMonth(studentId: string, year: number, month: number): Promise<Budget[]> {
    return await db.select().from(budgets)
      .where(and(
        eq(budgets.studentId, studentId),
        eq(budgets.year, year),
        eq(budgets.month, month)
      ));
  }

  async updateBudgetSpent(id: string, spentAmount: string): Promise<Budget> {
    const [budget] = await db.update(budgets)
      .set({ spentAmount })
      .where(eq(budgets.id, id))
      .returning();
    return budget;
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(insertLoan).returning();
    return loan;
  }

  async getLoan(studentId: string): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.studentId, studentId));
    return loan || undefined;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const [loan] = await db.update(loans).set(updates).where(eq(loans.id, id)).returning();
    return loan;
  }

  async getAllActiveLoans(): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.status, "active"));
  }

  async createRepayment(insertRepayment: InsertRepayment): Promise<Repayment> {
    const [repayment] = await db.insert(repayments).values(insertRepayment).returning();
    return repayment;
  }

  async getRepayments(loanId: string): Promise<Repayment[]> {
    return await db.select().from(repayments)
      .where(eq(repayments.loanId, loanId))
      .orderBy(desc(repayments.dueDate));
  }

  async updateRepaymentStatus(id: string, status: string, paidDate?: Date): Promise<Repayment> {
    const updates: any = { status };
    if (paidDate) updates.paidDate = paidDate;
    
    const [repayment] = await db.update(repayments)
      .set(updates)
      .where(eq(repayments.id, id))
      .returning();
    return repayment;
  }

  async getUpcomingRepayments(): Promise<(Repayment & { loan: Loan & { student: Student } })[]> {
    // Simplified approach to avoid complex type issues
    const result = await db
      .select()
      .from(repayments)
      .innerJoin(loans, eq(repayments.loanId, loans.id))
      .innerJoin(students, eq(loans.studentId, students.id))
      .where(eq(repayments.status, "pending"))
      .orderBy(repayments.dueDate)
      .limit(10);
    
    return result.map((row: any) => ({
      ...row.repayments,
      loan: {
        ...row.loans,
        student: row.students
      }
    })) as any;
  }

  async createAiAdvice(insertAiAdvice: InsertAiAdvice): Promise<AiAdvice> {
    const [advice] = await db.insert(aiAdvice).values(insertAiAdvice).returning();
    return advice;
  }

  async getAiAdvice(studentId: string): Promise<AiAdvice[]> {
    return await db.select().from(aiAdvice)
      .where(eq(aiAdvice.studentId, studentId))
      .orderBy(desc(aiAdvice.createdAt));
  }

  async markAdviceAsRead(id: string): Promise<AiAdvice> {
    const [advice] = await db.update(aiAdvice)
      .set({ isRead: true })
      .where(eq(aiAdvice.id, id))
      .returning();
    return advice;
  }

  // Statistics methods
  async getTotalStudentsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(students);
    return result[0].count;
  }

  async getTotalActiveLoansAmount(): Promise<string> {
    const result = await db.select({ 
      total: sql<string>`sum(${loans.outstandingAmount})` 
    }).from(loans).where(eq(loans.status, "active"));
    return result[0].total || "0";
  }

  async getMonthlyDisbursementsAmount(): Promise<string> {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const result = await db.select({ 
      total: sql<string>`sum(${disbursements.amount})` 
    }).from(disbursements)
    .where(and(
      gte(disbursements.createdAt, startOfMonth),
      lte(disbursements.createdAt, endOfMonth),
      eq(disbursements.status, "completed")
    ));
    
    return result[0].total || "0";
  }

  async getRepaymentRate(): Promise<number> {
    const totalRepayments = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(repayments);
    
    const completedRepayments = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(repayments).where(eq(repayments.status, "completed"));
    
    if (totalRepayments[0].count === 0) return 0;
    return (completedRepayments[0].count / totalRepayments[0].count) * 100;
  }
}

export const storage = new DatabaseStorage();
