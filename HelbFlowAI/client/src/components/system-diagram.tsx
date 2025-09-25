import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { University, Building, GraduationCap, ArrowRight, ArrowLeft, ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

export default function SystemDiagram() {
  return (
    <Card className="bg-card mb-8" data-testid="system-diagram">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Interaction Flow</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">HELB ↔ Students ↔ Banks</span>
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* HELB Section */}
          <div className="text-center" data-testid="helb-section">
            <div className="bg-primary/10 rounded-lg p-6 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <University className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">HELB</h4>
              <p className="text-sm text-muted-foreground">Central Management & AI Processing</p>
            </div>
            
            <div className="space-y-2 text-xs text-left">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Student registration & verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">AI-powered disbursement calculation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Budget monitoring & analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Repayment tracking & management</span>
              </div>
            </div>
          </div>
          
          {/* Arrows and Integration */}
          <div className="flex flex-col items-center justify-center space-y-4" data-testid="integration-section">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">API Integration</span>
              <ArrowLeft className="h-5 w-5 text-secondary" />
            </div>
            
            <div className="bg-accent rounded-lg p-4 text-center">
              <RotateCcw className="h-6 w-6 text-foreground mx-auto mb-2" />
              <h5 className="text-sm font-medium text-foreground">Secure Data Exchange</h5>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 text-left">
                <li>• Real-time transaction processing</li>
                <li>• Automated fund transfers</li>
                <li>• Credit profile sharing</li>
                <li>• Repayment automation</li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2">
              <ArrowDown className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Mobile/Web App</span>
              <ArrowUp className="h-5 w-5 text-secondary" />
            </div>
          </div>
          
          {/* Partner Banks Section */}
          <div className="text-center" data-testid="banks-section">
            <div className="bg-secondary/10 rounded-lg p-6 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Partner Banks</h4>
              <p className="text-sm text-muted-foreground">Financial Infrastructure & Services</p>
            </div>
            
            <div className="space-y-2 text-xs text-left">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground">Student account management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground">Automated disbursements</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground">Transaction monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground">Repayment collection</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Student Layer */}
        <div className="mt-8 pt-6 border-t border-border" data-testid="students-section">
          <div className="text-center">
            <div className="bg-accent rounded-lg p-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-background" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Students</h4>
              <p className="text-sm text-muted-foreground mb-4">End Users & Beneficiaries</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                    <span className="text-muted-foreground">Profile management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                    <span className="text-muted-foreground">Loan applications</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                    <span className="text-muted-foreground">Budget tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                    <span className="text-muted-foreground">Repayment monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
