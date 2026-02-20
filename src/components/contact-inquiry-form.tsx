"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ContactInquiryLabels = {
  inquiryTitle: string;
  inquiryIntro: string;
  fullName: string;
  emailAddress: string;
  subject: string;
  message: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  sendMessage: string;
};

type ContactInquiryFormProps = {
  locale: "en" | "ar";
  labels: ContactInquiryLabels;
  initialStatus?: "success" | "error";
};

type FeedbackType = "success" | "error" | null;

export default function ContactInquiryForm({ locale, labels, initialStatus }: ContactInquiryFormProps) {
  const [isSending, setIsSending] = useState(false);

  const statusCopy = useMemo(
    () =>
      locale === "ar"
        ? {
            sending: "جار إرسال الرسالة...",
            success: "تم إرسال رسالتك بنجاح.",
            error: "تعذر إرسال الرسالة حالياً. يرجى المحاولة لاحقاً.",
          }
        : {
            sending: "Sending message...",
            success: "Your message has been sent successfully.",
            error: "Unable to send your message right now. Please try again later.",
          },
    [locale],
  );

  const initialFeedbackType: FeedbackType = initialStatus === "success" || initialStatus === "error" ? initialStatus : null;
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialFeedbackType);
  const [feedback, setFeedback] = useState(() => {
    if (initialFeedbackType === "success") {
      return statusCopy.success;
    }
    if (initialFeedbackType === "error") {
      return statusCopy.error;
    }
    return "";
  });

  useEffect(() => {
    if (initialStatus === "success") {
      setFeedbackType("success");
      setFeedback(statusCopy.success);
      return;
    }
    if (initialStatus === "error") {
      setFeedbackType("error");
      setFeedback(statusCopy.error);
      return;
    }
    setFeedbackType(null);
    setFeedback("");
  }, [initialStatus, statusCopy.error, statusCopy.success]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      locale: String(formData.get("locale") ?? locale).trim(),
    };

    setIsSending(true);
    setFeedback("");
    setFeedbackType(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setFeedbackType("error");
        setFeedback(data?.message ?? statusCopy.error);
        return;
      }

      form.reset();
      setFeedbackType("success");
      setFeedback(data?.message ?? statusCopy.success);
    } catch {
      setFeedbackType("error");
      setFeedback(statusCopy.error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <h2 className="contactTitle">{labels.inquiryTitle}</h2>
      <p className="contactIntro">{labels.inquiryIntro}</p>

      <form className="contactForm" action="/api/contact" method="post" onSubmit={handleSubmit}>
        <input type="hidden" name="locale" value={locale} />

        <div className="contactField contactFieldTrap" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" autoComplete="off" tabIndex={-1} />
        </div>

        <div className="contactField">
          <label htmlFor="contact-name">{labels.fullName}</label>
          <input id="contact-name" name="name" type="text" placeholder={labels.namePlaceholder} required />
        </div>

        <div className="contactField">
          <label htmlFor="contact-email">{labels.emailAddress}</label>
          <input id="contact-email" name="email" type="email" placeholder={labels.emailPlaceholder} required />
        </div>

        <div className="contactField">
          <label htmlFor="contact-subject">{labels.subject}</label>
          <input id="contact-subject" name="subject" type="text" placeholder={labels.subjectPlaceholder} required />
        </div>

        <div className="contactField">
          <label htmlFor="contact-message">{labels.message}</label>
          <textarea id="contact-message" name="message" placeholder={labels.messagePlaceholder} rows={6} required />
        </div>

        <button className="contactSubmit" type="submit" disabled={isSending}>
          {isSending ? statusCopy.sending : labels.sendMessage}
        </button>

        {feedback ? (
          <p className={`contactFormStatus${feedbackType === "success" ? " isSuccess" : " isError"}`} role="status">
            {feedback}
          </p>
        ) : null}
      </form>
    </>
  );
}
