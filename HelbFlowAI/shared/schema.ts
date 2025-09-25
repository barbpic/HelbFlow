import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("student"), // student, officer, admin
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  studentId: text("student_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  course: text("course").notNull(),
  institution: text("institution").notNull(),
  region: text("region").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const disbursements = pgTable("disbursements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  type: text("type").notNull(), // tuition, upkeep, books, supplies
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  recipient: text("recipient"), // university, student
  aiRecommendation: json("ai_recommendation"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(), // food, transport, entertainment, accommodation, books
  description: text("description"),
  date: timestamp("date").default(sql`now()`),
  merchantName: text("merchant_name"),
  isAutoCategorized: boolean("is_auto_categorized").default(false),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  category: text("category").notNull(),
  budgetAmount: decimal("budget_amount", { precision: 12, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default("0"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  alertThreshold: decimal("alert_threshold", { precision: 5, scale: 2 }).default("80"), // percentage
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"), // active, graduated, defaulted, paid
  graduationDate: timestamp("graduation_date"),
  repaymentStartDate: timestamp("repayment_start_date"),
  monthlyRepayment: decimal("monthly_repayment", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const repayments = pgTable("repayments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").references(() => loans.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // standing_order, payroll_deduction, manual
  status: text("status").notNull().default("pending"), // pending, completed, failed
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const aiAdvice = pgTable("ai_advice", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  type: text("type").notNull(), // budgeting, overspending, savings, financial_tip
  message: text("message").notNull(),
  category: text("category"), // category related to the advice
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  disbursements: many(disbursements),
  transactions: many(transactions),
  budgets: many(budgets),
  loans: many(loans),
  aiAdvice: many(aiAdvice),
}));

export const disburgementsRelations = relations(disbursements, ({ one }) => ({
  student: one(students, {
    fields: [disbursements.studentId],
    references: [students.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  student: one(students, {
    fields: [transactions.studentId],
    references: [students.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  student: one(students, {
    fields: [budgets.studentId],
    references: [students.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  student: one(students, {
    fields: [loans.studentId],
    references: [students.id],
  }),
  repayments: many(repayments),
}));

export const repaymentsRelations = relations(repayments, ({ one }) => ({
  loan: one(loans, {
    fields: [repayments.loanId],
    references: [loans.id],
  }),
}));

export const aiAdviceRelations = relations(aiAdvice, ({ one }) => ({
  student: one(students, {
    fields: [aiAdvice.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertDisbursementSchema = createInsertSchema(disbursements).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export const insertRepaymentSchema = createInsertSchema(repayments).omit({
  id: true,
  createdAt: true,
  paidDate: true,
});

export const insertAiAdviceSchema = createInsertSchema(aiAdvice).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertDisbursement = z.infer<typeof insertDisbursementSchema>;
export type Disbursement = typeof disbursements.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertRepayment = z.infer<typeof insertRepaymentSchema>;
export type Repayment = typeof repayments.$inferSelect;
export type InsertAiAdvice = z.infer<typeof insertAiAdviceSchema>;
export type AiAdvice = typeof aiAdvice.$inferSelect;
