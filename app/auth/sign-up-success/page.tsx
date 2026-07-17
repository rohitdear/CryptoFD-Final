"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
            <CheckCircle className="h-6 w-6 text-chart-2" />
          </div>
          <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
          <CardDescription className="text-muted-foreground">
            {"We've sent you a confirmation link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
            <Mail className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Please check your email and click the confirmation link to activate your account.
            </p>
          </div>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
