import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EventDetailsFormProps {
  onNext: (data: { title: string; email: string }) => void;
}

export default function EventDetailsForm({ onNext }: EventDetailsFormProps) {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ title, email });
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="card-event-details">
      <CardHeader>
        <CardTitle data-testid="text-form-title">Event Details</CardTitle>
        <CardDescription data-testid="text-form-description">
          Enter basic information about your event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" data-testid="label-title">Event Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Meeting, Coffee Chat"
              required
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" data-testid="label-email">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizer@example.com"
              required
              data-testid="input-email"
            />
            <p className="text-sm text-muted-foreground" data-testid="text-email-help">
              We'll send you a link to edit this event
            </p>
          </div>

          <Button type="submit" className="w-full" data-testid="button-next">
            Next Step
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
