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
  media: {
    mainVideo: {
      id: "VID-01",
      src: "/media/videos/original/meska-ai-diploma-main-video.mp4",
      poster:
        "/media/images/posters/meska-ai-diploma-main-video-poster.webp",
      title: "Meska AI Co-Pilot Diploma overview",
      durationLabel: "01:56 · 1080p",
      width: 1920,
      height: 1080,
    },
    organizationSection: {
      eyebrow: "Our Impact",
      title:
        "Professionals from Egypt’s Leading Corporations Learn AI with Meska",
      description:
        "Professionals across these organizations have joined Meska’s AI learning experiences.",
    },
    organizationLogos: [
      {
        id: "LOGO-01",
        name: "SODIC",
        src: "/media/logos/monochrome/sodic.png",
        width: 738,
        height: 189,
      },
      {
        id: "LOGO-05",
        name: "Banque Misr",
        src: "/media/logos/monochrome/banque-misr.png",
        width: 2560,
        height: 1056,
      },
      {
        id: "LOGO-08",
        name: "AXA",
        src: "/media/logos/monochrome/axa.png",
        width: 855,
        height: 855,
      },
      {
        id: "LOGO-13",
        name: "WUZZUF",
        src: "/media/logos/monochrome/wuzzuf.png",
        width: 1696,
        height: 272,
      },
      {
        id: "LOGO-03",
        name: "Emirates NBD",
        src: "/media/logos/monochrome/emirates-nbd.png",
        width: 1054,
        height: 258,
      },
      {
        id: "LOGO-07",
        name: "Palm Hills Developments",
        src: "/media/logos/monochrome/palm-hills-developments.png",
        width: 962,
        height: 764,
      },
      {
        id: "LOGO-14",
        name: "Orange",
        src: "/media/logos/monochrome/orange.svg",
        width: 284,
        height: 284,
      },
      {
        id: "LOGO-02",
        name: "Orascom Development",
        src: "/media/logos/monochrome/orascom-development.png",
        width: 2244,
        height: 630,
      },
      {
        id: "LOGO-16",
        name: "The American University in Cairo",
        src: "/media/logos/monochrome/american-university-cairo.png",
        width: 301,
        height: 186,
      },
      {
        id: "LOGO-04",
        name: "Wadi Group",
        src: "/media/logos/monochrome/wadi-group.png",
        width: 1007,
        height: 349,
      },
      {
        id: "LOGO-09",
        name: "National Bank of Egypt",
        src: "/media/logos/monochrome/national-bank-of-egypt.png",
        width: 184,
        height: 217,
      },
      {
        id: "LOGO-06",
        name: "Hassan Allam Properties",
        src: "/media/logos/monochrome/hassan-allam-properties.png",
        width: 952,
        height: 626,
      },
      {
        id: "LOGO-12",
        name: "G Developments",
        src: "/media/logos/monochrome/g-developments.png",
        width: 318,
        height: 40,
      },
      {
        id: "LOGO-10",
        name: "saib",
        src: "/media/logos/monochrome/saib.png",
        width: 391,
        height: 240,
      },
      {
        id: "LOGO-15",
        name:
          "Arab Academy for Science, Technology and Maritime Transport",
        src: "/media/logos/monochrome/arab-academy.png",
        width: 894,
        height: 882,
      },
      {
        id: "LOGO-17",
        name: "Orascom Construction",
        src: "/media/logos/monochrome/orascom-construction.png",
        width: 2308,
        height: 468,
      },
    ],
    testimonials: [
      {
        id: "IMG-01",
        name: "Ali Elsheikh",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-ali-elsheikh.webp",
        width: 736,
        height: 1326,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Ali Elsheikh",
      },
      {
        id: "IMG-02",
        name: "Eslam Momtaz",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-eslam-momtaz.webp",
        width: 734,
        height: 1288,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Eslam Momtaz",
      },
      {
        id: "IMG-03",
        name: "Eslam Osman",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-eslam-osman.webp",
        width: 734,
        height: 1068,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Eslam Osman",
      },
      {
        id: "IMG-04",
        name: "Amr Mosallam",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-amr-mosallam.webp",
        width: 724,
        height: 1096,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Amr Mosallam",
      },
      {
        id: "IMG-05",
        name: "Ibrahim Mubarak",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-ibrahim-mubarak.webp",
        width: 732,
        height: 1216,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Ibrahim Mubarak",
      },
      {
        id: "IMG-06",
        name: "Reem Fahim",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-reem-fahim.webp",
        width: 732,
        height: 1060,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Reem Fahim",
      },
      {
        id: "IMG-07",
        name: "Ali Shaker",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-ali-shaker.webp",
        width: 736,
        height: 1112,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Ali Shaker",
      },
      {
        id: "IMG-08",
        name: "Dr. Khaled Said Salem",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-khaled-said-salem.webp",
        width: 730,
        height: 1056,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Dr. Khaled Said Salem",
      },
      {
        id: "IMG-09",
        name: "Kholoud Samy",
        caption: "AI Copilot Diploma graduate",
        src: "/media/images/optimized/testimonial-kholoud-samy.webp",
        width: 726,
        height: 1164,
        alt: "Meska AI post celebrating AI Copilot Diploma graduate Kholoud Samy",
      },
    ],
  },
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
    stickyCta: "sticky_mobile_start_application",
    primaryForm: "primary_interest_form",
    modalForm: "modal_interest_form",
    thankYouView: "lead_thank_you_view",
    offlineCheckout: "offline_shopify_checkout",
    onlineCheckout: "online_shopify_checkout",
  },
} as const;

export const diplomaList: Diploma[] = [
  siteContent.diplomas.offline,
  siteContent.diplomas.online,
];
