export type DiplomaId = "offline" | "online";

export type Diploma = {
  id: DiplomaId;
  label: string;
  wave: string;
  startDate: string;
  time: string;
  duration: string;
  format: string;
  location: string;
  price: string;
  priceValue: number;
  currency: "EGP";
  checkoutUrl: string;
  included: string[];
};

export const siteContent = {
  brand: {
    name: "Meska AI",
    diplomaName: "AI Co-Pilot Diploma",
  },
  hero: {
    eyebrow: "AI Co-Pilot Diploma · New waves now open",
    title: "Learn AI for business.",
    accent: "Automate work. Lead smarter. Make better decisions.",
    subtitle:
      "A hands-on diploma that helps professionals and managers use AI to automate daily work, improve decisions, and manage teams smarter.",
    primaryCta: "Start Application",
  },
  form: {
    title: "Start your application",
    submitLabel: "Start Application",
    disclosure:
      "This is not a payment form. Share your interest and the Meska AI team will contact you with the next steps.",
    prototypeNote:
      "Prototype mode: submissions are not stored yet. The Google Sheet connection will be added in Framer.",
  },
  diplomas: {
    offline: {
      id: "offline",
      label: "Offline Diploma",
      wave: "Wave 14",
      startDate: "22 August 2026",
      time: "To be confirmed",
      duration: "11 sessions + graduation project",
      format: "8 offline + 3 online live sessions",
      location: "Creativa Innovation Hub · Giza",
      price: "EGP 25,000",
      priceValue: 25000,
      currency: "EGP",
      checkoutUrl: "",
      included: [
        "8 offline + 3 online intensive sessions",
        "Hands-on practice with AI tools",
        "Graduation project evaluated by industry leaders",
        "Lifetime Meska Community access",
        "Certificate of completion",
        "1-on-1 mentorship from AI professionals",
        "Guest lectures with industry leaders",
        "Lifetime alumni network access",
      ],
    },
    online: {
      id: "online",
      label: "Online Diploma",
      wave: "Wave 10",
      startDate: "23 August 2026",
      time: "To be confirmed",
      duration: "11 sessions + graduation project",
      format: "8 live + 3 online recap sessions",
      location: "Virtual · Live sessions",
      price: "EGP 20,000",
      priceValue: 20000,
      currency: "EGP",
      checkoutUrl: "",
      included: [
        "8 live + 3 recap intensive sessions",
        "Hands-on practice with AI tools",
        "Graduation project evaluated by industry leaders",
        "Lifetime Meska Community access",
        "Certificate of completion",
        "1-on-1 mentorship from AI professionals",
        "Guest lectures with industry leaders",
        "Lifetime alumni network access",
      ],
    },
  } satisfies Record<DiplomaId, Diploma>,
  stats: [
    { value: "2,000+", label: "Student graduates" },
    { value: "100+", label: "Corporate teams trained" },
    { value: "7+", label: "Delivery countries" },
  ],
  outcomes: [
    {
      number: "01",
      title: "Transform daily work",
      description:
        "Build AI workflows for research, writing, analysis, planning, and reporting.",
    },
    {
      number: "02",
      title: "Make better decisions",
      description:
        "Use AI as a thinking partner to solve challenges, compare options, and move with clarity.",
    },
    {
      number: "03",
      title: "Automate repetitive work",
      description:
        "Apply structured automation across emails, follow-ups, tasks, CRM, ERP, and reports.",
    },
    {
      number: "04",
      title: "Design AI-enabled solutions",
      description:
        "Create practical solutions that reduce cost, save time, improve speed, and enhance experiences.",
    },
  ],
  syllabus: [
    {
      number: "01",
      title: "Intro to AI Science",
      outcome:
        "Build essential AI vocabulary, understand what AI can and cannot do, and create your first Industry Disruption Map.",
    },
    {
      number: "02",
      title: "Prompting, Applied",
      outcome:
        "Build reusable prompt systems connected to your role, tasks, and daily workflows.",
    },
    {
      number: "03",
      title: "AI Tools, Feature-First · Part 1",
      outcome:
        "Choose AI tools by capability for research, reasoning, document analysis, search, and decision support.",
    },
    {
      number: "04",
      title: "AI Tools, Feature-First · Part 2",
      outcome:
        "Configure assistants, use vision and voice, and generate practical dashboards, tools, and structured documents.",
    },
    {
      number: "05",
      title: "AI Tools to Automation",
      outcome:
        "Move from manual AI use to structured workflows and create your first scheduled AI task.",
    },
    {
      number: "06",
      title: "Automation to AI Agents",
      outcome:
        "Design systems with triggers, tools, guardrails, and trust, then turn a scheduled task into a working agent.",
    },
    {
      number: "07",
      title: "AI in Business + Startup Build",
      outcome:
        "Connect AI to revenue, cost, risk, and experience, then identify and begin building an AI-powered solution.",
    },
    {
      number: "08",
      title: "Content Creation: Image, Video, Avatars",
      outcome:
        "Build scalable AI content systems for on-brand text, visuals, and conversion-ready media.",
    },
    {
      number: "09",
      title: "Graduation Project · Take the Stage",
      outcome:
        "Design and present a real-world AI solution for a problem in your work to an industry panel.",
    },
  ],
  instructors: [
    {
      name: "Nabil Khalifa",
      title: "CEO at Meska AI",
      secondaryTitle: "Co-Founder, Hive Analytics & Sigma Fit",
      bio: "Serial entrepreneur who has co-founded and grown multiple companies between Egypt and the U.S., raised tens of millions in funding, and built cross-border teams with deep ties in the global VC ecosystem.",
    },
    {
      name: "Dr. Amr Fahmy",
      title: "L&D Director at Meska AI",
      secondaryTitle: "Expert AI Business Strategist",
      bio: "13+ years transforming organizations through strategic L&D and AI-powered solutions. Trained over 10,000 professionals across every major industry.",
    },
    {
      name: "Youssef Al Refaey",
      title: "Growth Director at Meska AI",
      secondaryTitle: "AI & Digital Technology Trainer",
      bio: "8+ years in the software industry training thousands of professionals across corporations, government, healthcare, and universities in prompt engineering and AI automation.",
    },
    {
      name: "Ahmed Mostafa",
      title: "Head of R&D at Meska AI",
      secondaryTitle: "Licensed Career Consultant (GCDF-19018)",
      bio: "7,000+ training hours across B2C and B2B sectors. A licensed career development consultant and AI trainer specializing in AI applications to professional growth.",
    },
  ],
  faq: [
    {
      question: "What are the eligibility requirements?",
      answer: "Final eligibility details will be supplied by Meska AI before the production launch.",
    },
    {
      question: "How does payment work?",
      answer:
        "Payment takes place through Shopify. The current diploma information states that flexible payment plans are available, including five interest-free installments with Sympl.",
    },
    {
      question: "What is the attendance format?",
      answer:
        "The offline option combines 8 offline and 3 online live sessions. The online option combines 8 live and 3 online recap sessions.",
    },
    {
      question: "Are recordings included?",
      answer: "Recording availability is still to be confirmed by Meska AI.",
    },
    {
      question: "Will I receive a certificate?",
      answer: "Yes. A certificate of completion is listed as included with both diploma options.",
    },
    {
      question: "What is the cancellation or refund policy?",
      answer: "The final cancellation and refund policy will be supplied before checkout links go live.",
    },
  ],
  trackingNames: {
    landingView: "diploma_landing_view",
    heroCta: "hero_start_application",
    stickyCta: "sticky_mobile_start_application",
    midCta: "midpage_start_application",
    primaryForm: "primary_interest_form",
    modalForm: "modal_interest_form",
    finalForm: "final_interest_form",
    thankYouView: "lead_thank_you_view",
    offlineCheckout: "offline_shopify_checkout",
    onlineCheckout: "online_shopify_checkout",
  },
} as const;

export const diplomaList: Diploma[] = [
  siteContent.diplomas.offline,
  siteContent.diplomas.online,
];
