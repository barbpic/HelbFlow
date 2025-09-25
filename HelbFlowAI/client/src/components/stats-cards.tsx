import { Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalStudents: number;
  totalActiveLoans: string;
  monthlyDisbursements: string;
  repaymentRate: string;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Students",
      value: stats?.totalStudents?.toLocaleString() || "0",
      icon: Users,
      change: "+2.5% from last month",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Loans",
      value: `KSh ${parseFloat(stats?.totalActiveLoans || "0").toLocaleString()}`,
      icon: DollarSign,
      change: "+12.3% from last month",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Disbursements This Month",
      value: `KSh ${parseFloat(stats?.monthlyDisbursements || "0").toLocaleString()}`,
      icon: TrendingUp,
      change: "+8.1% from last month",
      color: "bg-accent text-foreground",
    },
    {
      title: "Repayment Rate",
      value: `${stats?.repaymentRate || "0"}%`,
      icon: BarChart3,
      change: "+3.2% from last month",
      color: "bg-secondary/10 text-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-card rounded-lg border border-border p-6" data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-semibold text-foreground" data-testid={`value-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-secondary">{card.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
