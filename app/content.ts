export type DiplomaId = "offline" | "online";

export type Diploma = {
  id: DiplomaId;
  label: string;
  wave: string;
  startDate: string;
  schedule: string;
  time: string;
  duration: string;
  format: string;
  location: string;
  price: string;
  priceValue: number;
  currency: "EGP";
  checkoutUrl: string;
  leadDestination: string | null;
  leadDestinationStatus: "pending";
  formSubmitLabel: string;
  installmentNote: string;
  included: string[];
};

export type SkillValueItem = {
  id: string;
  capability: string;
  application: string;
  benefit: string;
  curriculumSessions: string[];
};

export const siteContent = {
  brand: {
    name: "Meska AI",
    diplomaName: "AI Co-Pilot Diploma",
  },
  hero: {
    eyebrow: "Meska AI Diploma",
    titleBeforeAccent: "Solve a real business bottleneck with AI.",
    titleAccent: "Build the solution in 8 weeks.",
    subtitle:
      "Bring a challenge from your work and learn by building alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.",
    primaryCta: "Watch Free Guide",
  },
  landingVideoHeading: "Why We Built the Diploma",
  form: {
    eyebrow: "Diploma enquiry",
    title: "Interested in joining the AI Co-Pilot Diploma?",
    disclosure:
      "Share your details for an eligibility review. A Meska advisor will contact you about fit, format, payment, and enrollment for the current wave.",
    reassurance: "Enquiry only. No payment is taken here.",
  },
  diplomas: {
    offline: {
      id: "offline",
      label: "Offline Diploma",
      wave: "Wave 15",
      startDate: "26 September 2026",
      schedule: "Every Saturday from 11AM to 4PM",
      time: "11AM to 4PM",
      duration: "11 sessions + graduation project",
      format: "8 offline + 3 online live sessions",
      location: "Creativa Innovation Hub · Giza",
      price: "EGP 25,000",
      priceValue: 25000,
      currency: "EGP",
      checkoutUrl:
        "https://aionline.meska.ai/checkouts/cn/hWNFhIiwrMjiccpLk4S6LHMp/en-eg?_r=AQABXK4iXZTRdGRlwSOl9-iRgmnxVhsceC_1stXdBBLG7M8",
      leadDestination: null,
      leadDestinationStatus: "pending",
      formSubmitLabel: "Check Eligibility & Enquire",
      installmentNote: "5 interest-free payments via Sympl.",
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
      wave: "Wave 11",
      startDate: "27 September 2026",
      schedule: "Every Sunday from 7PM to 11PM",
      time: "7PM to 11PM",
      duration: "11 sessions + graduation project",
      format: "8 live + 3 online recap sessions",
      location: "Virtual · Live sessions",
      price: "EGP 20,000",
      priceValue: 20000,
      currency: "EGP",
      checkoutUrl:
        "https://aionline.meska.ai/checkouts/cn/hWNFBXhbOuMmtlvxCWKSs35n/en-eg?_r=AQABZ-KT_ZesRudxZE6egaaE1qln6lpcrLJajz-FxH7Dbfw&cart_link_id=Qtc6lE74&channel=buy_button",
      leadDestination: null,
      leadDestinationStatus: "pending",
      formSubmitLabel: "Check Eligibility & Enquire",
      installmentNote: "5 interest-free payments via Sympl.",
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
  skillsToValue: [
    {
      id: "ai-foundations",
      capability: "AI foundations and tool selection",
      application:
        "Understand what AI can and cannot do, map how it may disrupt your industry, and choose tools by capability rather than hype.",
      benefit:
        "Make clearer technology choices and focus time and budget on tools that fit the business problem.",
      curriculumSessions: ["01", "03"],
    },
    {
      id: "applied-prompting",
      capability: "Applied prompting",
      application:
        "Build reusable prompt systems around your role, context, recurring tasks, and quality requirements.",
      benefit:
        "Produce stronger work faster and more consistently across everyday responsibilities.",
      curriculumSessions: ["02"],
    },
    {
      id: "research-analysis",
      capability: "Research and information analysis",
      application:
        "Use AI for research, reasoning, search, document analysis, comparison, and decision support.",
      benefit:
        "Reach better-informed decisions in less time and turn complex information into usable insight.",
      curriculumSessions: ["03"],
    },
    {
      id: "structured-outputs",
      capability: "Assistants and structured outputs",
      application:
        "Configure assistants and use vision, voice, dashboards, tools, and structured documents to support real work.",
      benefit:
        "Turn scattered information into practical outputs that teams can understand, use, and act on.",
      curriculumSessions: ["04"],
    },
    {
      id: "workflow-automation",
      capability: "Workflow design and automation",
      application:
        "Move from one-off AI use to structured workflows and scheduled tasks that handle repeatable steps.",
      benefit:
        "Save time, reduce manual effort, and make recurring work more reliable.",
      curriculumSessions: ["05"],
    },
    {
      id: "agent-design",
      capability: "AI-agent design",
      application:
        "Design task systems using triggers, tools, guardrails, and trust, then turn a scheduled task into a working agent.",
      benefit:
        "Create more capable AI-enabled processes while keeping responsibilities and safeguards clear.",
      curriculumSessions: ["06"],
    },
    {
      id: "business-prototyping",
      capability: "Business-solution prototyping",
      application:
        "Frame AI opportunities around revenue, cost, risk, and experience, then begin building a practical solution.",
      benefit:
        "Test the value of an idea before committing major time or budget and communicate its business case clearly.",
      curriculumSessions: ["07"],
    },
    {
      id: "media-creation",
      capability: "AI content and media creation",
      application:
        "Build scalable systems for on-brand text, images, video, avatars, and conversion-ready media.",
      benefit:
        "Increase content capacity while protecting consistency, speed, and brand quality.",
      curriculumSessions: ["08"],
    },
    {
      id: "graduation-execution",
      capability: "Graduation-project execution",
      application:
        "Design and present a real AI solution for a problem in your work to an industry panel.",
      benefit:
        "Leave with a tested concept, practical implementation experience, and a clearer way to champion AI at work.",
      curriculumSessions: ["09"],
    },
  ] satisfies SkillValueItem[],
  instructors: [
    {
      id: "nabil-khalifa",
      name: "Nabil Khalifa",
      title: "CEO at Meska AI",
      secondaryTitle: "Co-Founder, Hive Analytics & Sigma Fit",
      bio: "Serial entrepreneur who has co-founded and grown multiple companies between Egypt and the U.S., raised tens of millions in funding, and built cross-border teams with deep ties in the global VC ecosystem.",
      image: "/media/instructors/optimized/nabil-khalifa.webp",
      imageWidth: 1080,
      imageHeight: 1350,
      imageAlt: "Nabil Khalifa speaking at a Meska AI event",
      linkedin: "https://eg.linkedin.com/in/nabil-khalifa-96702090",
    },
    {
      id: "amr-fahmy",
      name: "Dr. Amr Fahmy",
      title: "L&D Director at Meska AI",
      secondaryTitle: "Expert AI Business Strategist",
      bio: "13+ years transforming organizations through strategic L&D and AI-powered solutions. Trained over 10,000 professionals across every major industry.",
      image: "/media/instructors/optimized/amr-fahmy.webp",
      imageWidth: 1080,
      imageHeight: 1350,
      imageAlt: "Dr. Amr Fahmy, L&D Director at Meska AI",
      linkedin: "https://eg.linkedin.com/in/amrfahmyofficial",
    },
    {
      id: "youssef-al-refaey",
      name: "Youssef Al Refaey",
      title: "Growth Director at Meska AI",
      secondaryTitle: "AI & Digital Technology Trainer",
      bio: "8+ years in the software industry training thousands of professionals across corporations, government, healthcare, and universities in prompt engineering and AI automation.",
      image: "/media/instructors/optimized/youssef-al-refaey.webp",
      imageWidth: 1080,
      imageHeight: 1350,
      imageAlt: "Youssef Al Refaey, Growth Director at Meska AI",
      linkedin: "https://eg.linkedin.com/in/youssef-al-refaey-361a6214a",
    },
    {
      id: "omar-el-monayar",
      name: "Omar El Monayar",
      title: "Co-Founder, Meska AI",
      secondaryTitle: "",
      bio: "I strive to enhance human lives through futuristic tech, using deep-tech innovation, blockchain, and smart wearables to empower adaptability and unlock new capabilities.",
      image: "/media/instructors/optimized/omar-el-monayar.webp",
      imageWidth: 800,
      imageHeight: 800,
      imageAlt: "Omar El Monayar, Co-Founder of Meska AI",
      linkedin: "https://www.linkedin.com/in/omarelmonayar/",
    },
  ],
  media: {
    brandLogo: {
      src: "/media/brand/original/meska-2026-logo.png",
      alt: "Meska AI",
      width: 3283,
      height: 576,
    },
    mainVideo: {
      id: "VID-01",
      streamId: "ab1723404c487a7f9adaac258e5673c6",
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
    freeGuideVideo: {
      id: "thank_you_free_ai_agent_guide",
      streamId: "c386998a14da13215f0577a22e570a73",
      title: "Build Your First AI Agent: a practical free guide",
    },
    videoTestimonials: [
      { id: "video_testimonial_01", label: "Student testimonial 01", streamId: "9446c6669fea31f2a82c5e5c25ad04ad" },
      { id: "video_testimonial_02", label: "Student testimonial 02", streamId: "1c51117356f5628d29f9399fcbeeb1ba" },
      { id: "video_testimonial_03", label: "Student testimonial 03", streamId: "f4c905d8eab0a358ddf4e0e08f612019" },
      { id: "video_testimonial_04", label: "Student testimonial 04", streamId: "81016e15fa02f197293756409c7560b4" },
      { id: "video_testimonial_05", label: "Student testimonial 05", streamId: "020a4007ee602cfecf62b3bccae1546e" },
      { id: "video_testimonial_06", label: "Student testimonial 06", streamId: "be9951ce4377f8fdde5dd32c216589df" },
      { id: "video_testimonial_07", label: "Student testimonial 07", streamId: "8bde09b5aba6f45ef3c2b0d6f4a49185" },
      { id: "video_testimonial_08", label: "Student testimonial 08", streamId: "5f51b5b0df5ef8546e2e3a8a0708329a" },
      { id: "video_testimonial_09", label: "Student testimonial 09", streamId: "eebc5609bdcf104f7cb06918a07c0919" },
    ],
    graduationVideo: {
      id: "thank_you_graduation_video",
      streamId: "70fd774da07ce0db65a5e515888e0e81",
      src: "/media/videos/optimized/graduation-wave.mp4",
      poster: "/media/images/posters/graduation-wave.webp",
      title: "A previous Meska AI diploma wave celebrating graduation",
      width: 720,
      height: 1280,
      durationSeconds: 141.909,
    },
    insideDiplomaVideos: [
      {
        id: "inside_diploma_video_01",
        streamId: "a82ebabcfbf23a79947f63ac8af25923",
        label: "Day 1 · Diploma session moment 01",
        src: "/media/videos/optimized/inside-diploma-session-01.mp4",
        poster: "/media/images/posters/inside-diploma/session-01.webp",
        width: 720,
        height: 1280,
        durationSeconds: 77.269,
      },
      {
        id: "inside_diploma_video_02",
        streamId: "f4f9912fee838ecfa9e3bb3596134c9a",
        label: "Day 9 · Diploma session moment 02",
        src: "/media/videos/optimized/inside-diploma-session-02.mp4",
        poster: "/media/images/posters/inside-diploma/session-02.webp",
        width: 720,
        height: 1280,
        durationSeconds: 95.659,
      },
      {
        id: "inside_diploma_video_03",
        streamId: "43cd9ee7aad707558cdc177079d38ddf",
        label: "Day 1 · Diploma session moment 03",
        src: "/media/videos/optimized/inside-diploma-session-03.mp4",
        poster: "/media/images/posters/inside-diploma/session-03.webp",
        width: 720,
        height: 1280,
        durationSeconds: 56.661,
      },
      {
        id: "inside_diploma_video_04",
        streamId: "bb88c111b8cac1301a151f87ebc1ae51",
        label: "Day 2 · Diploma session moment 04",
        src: "/media/videos/optimized/inside-diploma-session-04.mp4",
        poster: "/media/images/posters/inside-diploma/session-04.webp",
        width: 720,
        height: 1280,
        durationSeconds: 100.224,
      },
      {
        id: "inside_diploma_video_05",
        streamId: "b046a1ddd79fd68429d81ba1518935b4",
        label: "Day 6 · Diploma session moment 05",
        src: "/media/videos/optimized/inside-diploma-session-05.mp4",
        poster: "/media/images/posters/inside-diploma/session-05.webp",
        width: 720,
        height: 1280,
        durationSeconds: 103.659,
      },
      {
        id: "inside_diploma_video_06",
        streamId: "1f0c3366eb69d0f6f6622ed018613beb",
        label: "Day 7 · Diploma session moment 06",
        src: "/media/videos/optimized/inside-diploma-session-06.mp4",
        poster: "/media/images/posters/inside-diploma/session-06.webp",
        width: 720,
        height: 1280,
        durationSeconds: 101.525,
      },
      {
        id: "inside_diploma_video_07",
        streamId: "cf683d8d1e290fd725abee8bb3ba3860",
        label: "Diploma session moment 07",
        src: "/media/videos/optimized/inside-diploma-session-07.mp4",
        poster: "/media/images/posters/inside-diploma/session-07.webp",
        width: 720,
        height: 1280,
        durationSeconds: 147.755,
      },
      {
        id: "inside_diploma_video_08",
        streamId: "b835b84649921904bb3fea39460da2a4",
        label: "Day 3 · Diploma session moment 08",
        src: "/media/videos/optimized/inside-diploma-session-08.mp4",
        poster: "/media/images/posters/inside-diploma/session-08.webp",
        width: 720,
        height: 1280,
        durationSeconds: 86.123,
      },
      {
        id: "inside_diploma_video_09",
        streamId: "ef0d6902d47d43cdaa958a4e96aca468",
        label: "Diploma session moment 09",
        src: "/media/videos/optimized/inside-diploma-session-09.mp4",
        poster: "/media/images/posters/inside-diploma/session-09.webp",
        width: 720,
        height: 1280,
        durationSeconds: 112.64,
      },
    ],
  },
  faq: [
    {
      question: "Does submitting the application charge me?",
      answer:
        "No. Submitting the application only tells the Meska team that you are interested. A program advisor will contact you, explain the details, and answer your questions. No payment is taken through the application form.",
    },
    {
      question: "Do I need a technical background?",
      answer:
        "No. The diploma is designed for business professionals, managers, and entrepreneurs. You will learn how to use and apply AI without needing to code.",
    },
    {
      question: "Is the diploma genuinely practical and hands-on?",
      answer:
        "Yes. Sessions are built around guided practice, real business tasks, applied workflows, and a graduation project. The objective is not simply to understand AI concepts; it is to use them in your actual work.",
    },
    {
      question: "Will I receive support while applying what I learn?",
      answer:
        "Yes. You will have access to the Meska team and instructors through the program’s WhatsApp support channel. You can ask questions and get help as you apply the tools and workflows between sessions.",
    },
    {
      question: "Are the sessions recorded?",
      answer:
        "Yes. Sessions are recorded so you can revisit explanations, demonstrations, and practical exercises after the live session.",
    },
    {
      question: "What happens if I join Offline but miss a session?",
      answer:
        "The online cohort runs in parallel. If you miss an offline session, the Meska team can help you attend the corresponding online session where scheduling allows. You will also have access to the session recording.",
    },
    {
      question: "What is the difference between Online and Offline?",
      answer:
        "Offline combines 8 in-person sessions at Creativa Innovation Hub in Giza with 3 online live sessions. Online is delivered virtually through 8 live sessions and 3 online recap sessions. Both formats centre on guided practice, real work, recordings, and hands-on support; the main difference is where and how you prefer to participate.",
    },
    {
      question: "Are installment plans available?",
      answer:
        "Yes. You can pay through Sympl over five months, or speak with the Meska sales team to discuss the available payment arrangements.",
    },
    {
      question: "Will I receive a certificate?",
      answer:
        "Yes. You will receive a certificate of completion after successfully completing the diploma requirements.",
    },
    {
      question: "What are the eligibility requirements?",
      answer:
        "The diploma is designed for business professionals, managers, founders, and team leaders with at least 3–5 years of professional experience. You should be interested in applying AI to real business challenges and able to commit to the weekly live session, practical study, and graduation project.",
    },
    {
      question: "What is the selection criteria?",
      answer:
        "We look for business professionals with at least 3–5 years of experience who are enthusiastic about AI, ready to practise consistently, and willing to contribute to and learn from the diploma community. Applicants must also have enough time to participate fully throughout the eight weeks.",
    },
    {
      question: "What is the time commitment?",
      answer:
        "Plan for one live session each week, lasting up to five hours including breaks. In addition, you should dedicate approximately 15 hours per week to study, practice, applying the tools, and preparing your graduation project.",
    },
    {
      question: "How long is the diploma?",
      answer:
        "The diploma runs for eight weeks. Offline sessions take place every Saturday, while Online sessions take place every Sunday.",
    },
    {
      question: "What can I do to prepare?",
      answer:
        "Come ready to learn, practise, and contribute. The diploma works best when you actively apply what you learn and exchange experience with a group of like-minded business professionals.",
    },
    {
      question: "What is the cancellation or refund policy?",
      answer:
        "Cancellation and refund requests are accepted only before 25% of the diploma has been completed. After that point, the diploma fees are non-refundable.",
    },
    {
      question: "What language are sessions delivered in?",
      answer:
        "Sessions are primarily delivered in Arabic. Our instructors are also comfortable using English whenever it helps explain a concept, tool, or business case more clearly.",
    },
  ],
  trackingNames: {
    landingView: "diploma_landing_view",
    stickyCta: "sticky_start_application",
    landingFormatToggle: "landing_format_toggle",
    primaryForm: "primary_interest_form",
    modalForm: "modal_interest_form",
    thankYouView: "lead_thank_you_view",
    checkoutFormatToggle: "checkout_format_toggle",
    graduationVideo: "thank_you_graduation_video",
    offlineCheckout: "offline_shopify_checkout",
    onlineCheckout: "online_shopify_checkout",
    skillsMatrix: "skills_business_value_matrix",
  },
} as const;

export const diplomaList: Diploma[] = [
  siteContent.diplomas.offline,
  siteContent.diplomas.online,
];
