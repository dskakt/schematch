import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" data-testid="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                step < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : step === currentStep
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
              data-testid={`step-${step}`}
            >
              {step < currentStep ? (
                <Check className="w-4 h-4" data-testid={`icon-check-${step}`} />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step === currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid={`text-step-${step}`}
            >
              Step {step}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? "bg-primary" : "bg-border"
              }`}
              data-testid={`connector-${step}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
