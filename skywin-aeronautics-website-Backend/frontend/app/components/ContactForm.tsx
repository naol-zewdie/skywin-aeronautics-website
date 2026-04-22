"use client";

import { useState } from "react";
import Button from "./Button";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: data.message });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Something went wrong" });
      }
    } catch (error) {
      setStatus({ 
        type: "error", 
        message: "Network error. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)] p-10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[color:var(--foreground)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            required
            disabled={isSubmitting}
            className="mt-3 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background-alt)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[color:var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            required
            disabled={isSubmitting}
            className="mt-3 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background-alt)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[color:var(--foreground)]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            placeholder="Tell us about your project or request"
            required
            disabled={isSubmitting}
            className="mt-3 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background-alt)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Status Messages */}
        {status.type && (
          <div
            className={`p-4 rounded-2xl text-sm ${
              status.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
