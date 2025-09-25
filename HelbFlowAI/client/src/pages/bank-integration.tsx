import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Wifi,
  WifiOff,
  Shield,
  Key,
  TrendingUp,
  DollarSign,
  Users,
  Activity
} from "lucide-react";

interface BankPartner {
  id: string;
  name: string;
  logo: string;
  status: "connected" | "disconnected" | "pending";
  accountsLinked: number;
  lastSync: string;
  apiVersion: string;
  features: string[];
  connectionHealth: number;
}

interface APIEndpoint {
  name: string;
  endpoint: string;
  status: "active" | "inactive" | "error";
  lastCall: string;
  responseTime: number;
  successRate: number;
}

export default function BankIntegration() {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const { toast } = useToast();

  // Mock data for bank partners
  const bankPartners: BankPartner[] = [
    {
      id: "kcb",
      name: "KCB Bank",
      logo: "🏦",
      status: "connected",
      accountsLinked: 1247,
      lastSync: "2024-11-15T10:30:00Z",
      apiVersion: "v2.1",
      features: ["Disbursements", "Account Verification", "Transaction History", "Standing Orders"],
      connectionHealth: 98,
    },
    {
      id: "equity",
      name: "Equity Bank",
      logo: "🏛️",
      status: "connected",
      accountsLinked: 856,
      lastSync: "2024-11-15T10:25:00Z",
      apiVersion: "v1.8",
      features: ["Disbursements", "Account Verification", "Payroll Deductions"],
      connectionHealth: 95,
    },
    {
      id: "cooperative",
      name: "Co-operative Bank",
      logo: "🏪",
      status: "pending",
      accountsLinked: 0,
      lastSync: "Never",
      apiVersion: "v2.0",
      features: ["Disbursements", "Account Verification"],
      connectionHealth: 0,
    },
    {
      id: "absa",
      name: "Absa Bank",
      logo: "🏢",
      status: "disconnected",
      accountsLinked: 234,
      lastSync: "2024-11-10T15:45:00Z",
      apiVersion: "v1.5",
      features: ["Disbursements", "Transaction History"],
      connectionHealth: 0,
    },
  ];

  // Mock API endpoints
  const apiEndpoints: APIEndpoint[] = [
    {
      name: "Account Validation",
      endpoint: "/api/v2/accounts/validate",
      status: "active",
      lastCall: "2024-11-15T10:32:15Z",
      responseTime: 245,
      successRate: 99.2,
    },
    {
      name: "Disbursement Transfer",
      endpoint: "/api/v2/transfers/disburse",
      status: "active",
      lastCall: "2024-11-15T10:30:22Z",
      responseTime: 1200,
      successRate: 97.8,
    },
    {
      name: "Standing Orders",
      endpoint: "/api/v2/standing-orders",
      status: "active",
      lastCall: "2024-11-15T09:15:33Z",
      responseTime: 680,
      successRate: 96.5,
    },
    {
      name: "Transaction History",
      endpoint: "/api/v2/transactions/history",
      status: "error",
      lastCall: "2024-11-15T08:45:12Z",
      responseTime: 5000,
      successRate: 85.3,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "disconnected":
      case "inactive":
        return <WifiOff className="h-5 w-5 text-muted-foreground" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-secondary/10 text-secondary";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "disconnected":
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "error":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleToggleConnection = (bankId: string, currentStatus: string) => {
    const bank = bankPartners.find(b => b.id === bankId);
    if (!bank) return;

    if (currentStatus === "connected") {
      toast({
        title: "Bank Disconnected",
        description: `${bank.name} has been disconnected successfully.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bank Connected",
        description: `${bank.name} has been connected successfully.`,
      });
    }
  };

  const testAPIConnection = (endpoint: APIEndpoint) => {
    toast({
      title: "API Test Started",
      description: `Testing connection to ${endpoint.name}...`,
    });

    // Simulate API test
    setTimeout(() => {
      toast({
        title: "API Test Complete",
        description: `${endpoint.name} responded in ${endpoint.responseTime}ms`,
      });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background" data-testid="bank-integration-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Bank Integration Management</h2>
              <p className="text-sm text-muted-foreground">Manage partner bank connections, API endpoints, and data synchronization</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>{bankPartners.filter(b => b.status === "connected").length} Connected</span>
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="partners" className="space-y-6">
            <TabsList>
              <TabsTrigger value="partners" data-testid="tab-partners">
                <Building className="h-4 w-4 mr-2" />
                Bank Partners
              </TabsTrigger>
              <TabsTrigger value="apis" data-testid="tab-apis">
                <Activity className="h-4 w-4 mr-2" />
                API Monitoring
              </TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">
                <Shield className="h-4 w-4 mr-2" />
                Security & Auth
              </TabsTrigger>
            </TabsList>

            <TabsContent value="partners" className="space-y-6">
              {/* Integration Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Connected Banks</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {bankPartners.filter(b => b.status === "connected").length}
                        </p>
                      </div>
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Accounts</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {bankPartners.reduce((sum, bank) => sum + bank.accountsLinked, 0).toLocaleString()}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Transactions</p>
                        <p className="text-2xl font-semibold text-foreground">2,847</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">System Health</p>
                        <p className="text-2xl font-semibold text-foreground">96.8%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bank Partners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bankPartners.map((bank) => (
                  <Card key={bank.id} className="hover:shadow-md transition-shadow" data-testid={`bank-card-${bank.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{bank.logo}</span>
                          <span>{bank.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(bank.status)}
                          <Badge className={getStatusColor(bank.status)}>
                            {bank.status.charAt(0).toUpperCase() + bank.status.slice(1)}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Linked Accounts</p>
                          <p className="font-medium text-foreground">{bank.accountsLinked.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">API Version</p>
                          <p className="font-medium text-foreground">{bank.apiVersion}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Sync</p>
                          <p className="font-medium text-foreground">
                            {bank.lastSync === "Never" ? "Never" : new Date(bank.lastSync).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Health Score</p>
                          <p className="font-medium text-foreground">{bank.connectionHealth}%</p>
                        </div>
                      </div>

                      {bank.connectionHealth > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Connection Health</span>
                            <span className="font-medium">{bank.connectionHealth}%</span>
                          </div>
                          <Progress value={bank.connectionHealth} />
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Available Features</p>
                        <div className="flex flex-wrap gap-1">
                          {bank.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={bank.status === "connected"}
                            onCheckedChange={() => handleToggleConnection(bank.id, bank.status)}
                            data-testid={`switch-${bank.id}`}
                          />
                          <Label className="text-sm">
                            {bank.status === "connected" ? "Connected" : "Disconnected"}
                          </Label>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-sync-${bank.id}`}
                        >
                          Sync Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="apis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoint Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`api-endpoint-${index}`}>
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(endpoint.status)}
                          <div>
                            <p className="font-medium text-foreground">{endpoint.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{endpoint.endpoint}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Response: </span>
                              <span className="font-medium">{endpoint.responseTime}ms</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Success: </span>
                              <span className="font-medium">{endpoint.successRate}%</span>
                            </div>
                            <Badge className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => testAPIConnection(endpoint)}
                              data-testid={`button-test-${index}`}
                            >
                              Test
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Daily API Calls</p>
                        <p className="text-2xl font-semibold text-foreground">45,892</p>
                      </div>
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Response</p>
                        <p className="text-2xl font-semibold text-foreground">542ms</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Error Rate</p>
                        <p className="text-2xl font-semibold text-foreground">0.8%</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All bank integrations use industry-standard security protocols including OAuth 2.0, TLS 1.3 encryption, and regular security audits.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="h-5 w-5" />
                      <span>API Authentication</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">OAuth 2.0 Tokens</span>
                        <Badge className="bg-secondary/10 text-secondary">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">API Key Rotation</span>
                        <Badge className="bg-secondary/10 text-secondary">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Certificate Pinning</span>
                        <Badge className="bg-secondary/10 text-secondary">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rate Limiting</span>
                        <Badge className="bg-secondary/10 text-secondary">Configured</Badge>
                      </div>
                    </div>

                    <Button className="w-full" data-testid="button-refresh-tokens">
                      Refresh All Tokens
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Security Monitoring</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Failed Attempts (24h)</span>
                        <span className="font-medium text-foreground">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Suspicious Activity</span>
                        <span className="font-medium text-foreground">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Security Scan</span>
                        <span className="font-medium text-foreground">2 hours ago</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Security Score</span>
                        <Badge className="bg-secondary/10 text-secondary">A+</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" data-testid="button-security-audit">
                      Run Security Audit
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance & Auditing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="font-medium text-foreground">PCI DSS</p>
                      <p className="text-sm text-muted-foreground">Compliant</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="font-medium text-foreground">ISO 27001</p>
                      <p className="text-sm text-muted-foreground">Certified</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="font-medium text-foreground">GDPR</p>
                      <p className="text-sm text-muted-foreground">Compliant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
