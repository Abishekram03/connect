"use client";

import { useState } from "react";
import { Button } from "@connect/ui/components/button";
import { Input } from "@connect/ui/components/input";
import { Checkbox } from "@connect/ui/components/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DataCollectionFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    consentGiven: boolean;
  }) => Promise<void>;
  primaryColor?: string;
  isLoading?: boolean;
}

export const DataCollectionForm = ({
  onSubmit,
  primaryColor = "#3b82f6",
  isLoading = false,
}: DataCollectionFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!consentGiven) {
      newErrors.consent = "Please accept the consent to proceed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        consentGiven,
      });
    } catch (err) {
      console.error("Form submission failed:", err);
      setErrors({ submit: "Failed to submit. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-neutral-700">
          Your Name
        </label>
        <Input
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          disabled={isSubmitting || isLoading}
          className="h-9 text-sm"
        />
        {errors.name && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-neutral-700">
          Your Email
        </label>
        <Input
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          disabled={isSubmitting || isLoading}
          className="h-9 text-sm"
        />
        {errors.email && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-lg bg-blue-50 p-2.5 border border-blue-100">
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent"
            checked={consentGiven}
            onCheckedChange={(checked: boolean | "indeterminate") => {
              setConsentGiven(checked as boolean);
              if (errors.consent) setErrors({ ...errors, consent: "" });
            }}
            disabled={isSubmitting || isLoading}
            className="mt-0.5"
          />
          <label
            htmlFor="consent"
            className="text-[11px] text-neutral-600 leading-relaxed cursor-pointer flex-1"
          >
            I agree to share my information for support and product updates.
            <p className="mt-0.5 text-[10px] text-neutral-400">
              Withdraw consent anytime. GDPR/CCPA compliant.
            </p>
          </label>
        </div>
        {errors.consent && (
          <p className="text-xs text-red-500 flex items-center gap-1 ml-6">
            <AlertCircle className="h-3 w-3" /> {errors.consent}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="rounded border border-red-200 bg-red-50 p-2 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-red-600">{errors.submit}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="h-9 w-full text-sm font-medium"
        style={{
          backgroundColor:
            consentGiven && !isSubmitting ? primaryColor : "#d1d5db",
          color: "white",
        }}
      >
        {isSubmitting ? "Processing..." : "Continue"}
      </Button>
    </form>
  );
};
