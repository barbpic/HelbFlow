import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface DisbursementCalculation {
  tuition: number;
  upkeep: number;
  books: number;
  supplies: number;
  accommodation?: number;
  total: number;
  reasoning: string;
}

export interface BudgetAdvice {
  category: string;
  message: string;
  type: "warning" | "tip" | "alert";
  suggestedAction: string;
}

export interface SpendingAnalysis {
  overspendingCategories: string[];
  savingsOpportunities: string[];
  recommendations: string[];
  predictedSpending: number;
}

export class AIFinancialAdvisor {
  async calculateOptimalDisbursement(params: {
    course: string;
    institution: string;
    region: string;
    year: number;
    semester: number;
    previousSpending?: any[];
  }): Promise<DisbursementCalculation> {
    try {
      const prompt = `
        As a financial advisor for student loans in Kenya, calculate the optimal disbursement for:
        - Course: ${params.course}
        - Institution: ${params.institution}  
        - Region: ${params.region}
        - Academic Year: ${params.year}
        - Semester: ${params.semester}

        Consider:
        1. Course-specific costs (lab fees, practicals, etc.)
        2. Regional cost of living variations
        3. Institution fee structures
        4. Semester timing (beginning vs mid-year)
        5. Essential vs non-essential expenses

        Provide a breakdown in JSON format with tuition, monthly upkeep, books, supplies, and total amounts in KSh.
        Include reasoning for the calculations.

        Response format: {
          "tuition": number,
          "upkeep": number,
          "books": number,
          "supplies": number,
          "total": number,
          "reasoning": "explanation of calculations"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are an expert financial advisor specializing in Kenyan student loan optimization." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as DisbursementCalculation;
    } catch (error) {
      console.error("Error calculating disbursement:", error);
      // Fallback calculation
      return {
        tuition: 85000,
        upkeep: 12500,
        books: 8000,
        supplies: 5000,
        total: 110500,
        reasoning: "Default calculation based on average costs"
      };
    }
  }

  async analyzeBudgetAndProvideAdvice(params: {
    studentId: string;
    spending: any[];
    budgets: any[];
    monthlyIncome: number;
  }): Promise<BudgetAdvice[]> {
    try {
      const prompt = `
        Analyze this student's spending patterns and budget:
        
        Monthly Income: KSh ${params.monthlyIncome}
        
        Spending Data: ${JSON.stringify(params.spending)}
        
        Budget Allocations: ${JSON.stringify(params.budgets)}

        Provide financial advice focusing on:
        1. Overspending categories
        2. Budget adherence
        3. Savings opportunities
        4. Smart spending tips for students

        Return as JSON array of advice objects with category, message, type (warning/tip/alert), and suggestedAction.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a financial advisor helping Kenyan students manage their loan money responsibly." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.advice || [];
    } catch (error) {
      console.error("Error generating budget advice:", error);
      return [];
    }
  }

  async categorizeTransaction(description: string, merchantName?: string): Promise<string> {
    try {
      const prompt = `
        Categorize this transaction for a Kenyan student:
        Description: ${description}
        Merchant: ${merchantName || "Unknown"}

        Common categories: food, transport, entertainment, accommodation, books, supplies, utilities, healthcare, clothing, other

        Return only the category name.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are an expert at categorizing financial transactions for students in Kenya." },
          { role: "user", content: prompt }
        ],
      });

      return response.choices[0].message.content?.toLowerCase().trim() || "other";
    } catch (error) {
      console.error("Error categorizing transaction:", error);
      return "other";
    }
  }

  async generateFinancialTip(spendingPattern: any): Promise<string> {
    try {
      const prompt = `
        Based on this student's spending pattern, provide a helpful financial tip:
        ${JSON.stringify(spendingPattern)}

        Focus on practical advice for Kenyan students managing loan money.
        Keep it concise and actionable.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a financial mentor helping students make better money decisions." },
          { role: "user", content: prompt }
        ],
      });

      return response.choices[0].message.content || "Consider tracking your daily expenses to identify areas for savings.";
    } catch (error) {
      console.error("Error generating financial tip:", error);
      return "Consider tracking your daily expenses to identify areas for savings.";
    }
  }

  async analyzeSpendingTrends(transactions: any[]): Promise<SpendingAnalysis> {
    try {
      const prompt = `
        Analyze these transaction patterns for spending trends:
        ${JSON.stringify(transactions)}

        Identify:
        1. Categories with overspending
        2. Potential savings opportunities  
        3. Spending recommendations
        4. Predicted monthly spending

        Return as JSON with overspendingCategories[], savingsOpportunities[], recommendations[], and predictedSpending number.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a data analyst specializing in student financial behavior." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        overspendingCategories: result.overspendingCategories || [],
        savingsOpportunities: result.savingsOpportunities || [],
        recommendations: result.recommendations || [],
        predictedSpending: result.predictedSpending || 0
      };
    } catch (error) {
      console.error("Error analyzing spending trends:", error);
      return {
        overspendingCategories: [],
        savingsOpportunities: [],
        recommendations: [],
        predictedSpending: 0
      };
    }
  }
}

export const aiAdvisor = new AIFinancialAdvisor();
