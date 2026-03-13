import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
          <Card className="w-full max-w-md shadow-2xl border-destructive/50">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
                <CardDescription>
                  The application encountered an unexpected error. Please try reloading the page.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <Button onClick={this.handleReload} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                Reload Page
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  If the problem persists, please contact support at{' '}
                  <a href="tel:9500344749" className="font-semibold text-primary hover:underline">
                    9500344749
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
