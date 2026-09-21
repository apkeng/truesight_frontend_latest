import React from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import logo from "../assets/logo_colour.png";

const SUPPORT_EMAIL = "support@truesight.community";
const GRIEVANCE_EMAIL = "yadu@truesight.community";

/**
 * Bump both of these whenever the policy wording below changes - the Policy
 * promises 15 days' notice of material changes, which needs a visible date to
 * be evidenced. ISO form feeds the <time> element; the display form is what
 * readers see.
 */
const LAST_UPDATED_ISO = "2026-09-21";
const LAST_UPDATED = "21 September 2026";

/**
 * Policy content, kept as data rather than hand-written JSX so the wording can
 * be edited without touching layout. Block types: "p" (paragraph), "h3"
 * (sub-heading inside a section), "ul" (bulleted list), "table".
 *
 * Source: "Revised Privacy Policy.docx". Two placeholders in that document were
 * left unresolved by its author - the address for withdrawing consent, and the
 * Data Protection Board complaint portal link. See the comments at each site.
 */
const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    blocks: [
      {
        type: "p",
        text:
          'This Privacy Policy ("Privacy Policy/Policy") discloses the privacy practices for Apokryfon Private Limited (the company associated with the Truesight Student Platform) ("We/we" or "Us/us" or "Data Fiduciary"), a body corporate incorporated under the Companies Act, 2013, having its registered office at R519, PURVA PARK, JEEVANAHALLI MAIN ROAD, Bangalore, 560005 ("Company"), with regard to collection, storage, use, sharing, processing, and protection of the Personal Information and Sensitive Personal Data or Information (defined hereunder) of the customers, vendors, employees, and the users ("You/you" or "Your/your" or "Data Principal") and use of the online platform truesight.community ("Website"). This Privacy Policy along with the Terms of Use describes our practices regarding, including your choices in relation to how we collect, store, use, share, and secure your Personal Information across our Website. It also describes your choices regarding use, access, correction, and erasure of your Personal Information and your rights in relation to your Personal Information and how to contact us, our Grievance Officer, or the Data Protection Board of India in the event you have a complaint.',
      },
      {
        type: "p",
        text:
          "By providing your consent to this Privacy Policy and accepting the Terms of Use, you agree to the collection, use, transfer, processing, and storage of your Personal Information as set out in this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use/access this Website.",
      },
      {
        type: "p",
        text:
          "We will review this Privacy Policy from time to time to make sure it is up to date. If you are our registered user, we will notify you before we make changes to this Policy and give you the opportunity to review the revised Policy before you choose to continue using our services.",
      },
      { type: "h3", text: "Definitions" },
      {
        type: "p",
        text:
          'By "Personal Information," we mean any information that can either itself identify you as an individual ("Personally Identifying Information") or that can be connected to you indirectly by linking it to Personally Identifying Information. Please note that usage of the term Personal Information in this Privacy Policy includes Sensitive Personal Data or Information (SPDI), wherever appropriate and/or mandated under applicable laws.',
      },
      {
        type: "p",
        text:
          'By "Sensitive Personal Data or Information" or "SPDI," we mean such personal information which consists of information relating to passwords, financial information such as bank account or credit card or debit card or other payment instrument details, physical, physiological, or mental health condition, sexual orientation, medical records and history, biometric information, and any details relating to the above categories as defined under Rule 3 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.',
      },
      {
        type: "p",
        text:
          'By "Processing," we mean any operation or set of operations performed on Personal Information, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, dissemination, restriction, erasure, or destruction.',
      },
      {
        type: "p",
        text:
          'By "Consent," we mean free, specific, informed, unconditional, and unambiguous consent given by the Data Principal through a clear affirmative action, as required under Section 6 of the Digital Personal Data Protection Act, 2023.',
      },
    ],
  },
  {
    id: "collection",
    title: "Collection of Information",
    blocks: [
      {
        type: "p",
        text:
          "As a visitor, you can browse our Website to find out more about our Website. You are not required to provide us with any Personal Information as a visitor.",
      },
      {
        type: "p",
        text:
          "We collect your Personal Information when you register with us, when you express an interest in obtaining information about us or our products and services, when you participate in activities on our Website, or otherwise contact us.",
      },
      {
        type: "p",
        text:
          "We will only collect your Personal Information if we have a proper reason for doing so, e.g.: to comply with our legal and regulatory obligations; for the performance of our contract with you or to take steps at your request before entering into a contract; for our legitimate interests (where permitted by law) or those of a third party; or where you have given consent.",
      },
      {
        type: "p",
        text:
          "In some cases, we may also have a legal obligation to collect Personal Information from you or may otherwise need the Personal Information to protect your vital interests or those of another person (for example, to prevent payment fraud or confirm your identity).",
      },
      {
        type: "p",
        text:
          "Our primary goal in collecting your Personal Information is to provide you a safe, efficient, smooth, and customized experience. This allows us to provide courses, study material, tutorials that most likely meet your needs and to customize our Website to make your experience safer and easier. We also use your Personally Identifiable Information together with other information to help us better understand our users and to improve the content and functionality of our Website. The information we learn from you helps us personalize and continually improve your experience at our Website. We do not voluntarily make this information available to third parties, nor do we use it for any other purpose, except as set out herein.",
      },
      {
        type: "p",
        text:
          "When you visit our Website, as part of a purchase of one of our subscription or registering on our Website, we may collect a variety of Personal Information that you will voluntarily provide to us such as:",
      },
      {
        type: "ul",
        items: [
          "Contact Information, such as name, email address, display picture, mailing address, phone number, IP address, geographic location, or phone number.",
          "Information to enable us to check and verify your identity, e.g., your date of birth, mark-sheets, Passport/Aadhar/Voter ID details.",
          "Billing Information, such as debit card number, credit card number, and billing address.",
          "Unique Identifiers, such as username or password.",
          'Reviews or ratings, syllabus and course preferences, account settings (including preferences set in the "Account" section of our Website); and',
          "Information provided to us through our service, interaction with our customer service, participation in surveys or marketing promotions.",
        ],
      },
      {
        type: "p",
        text: "If you are an employee associated with Truesight, we collect the following Personal Information:",
      },
      {
        type: "ul",
        items: [
          "Name",
          "Address",
          "Email address",
          "Contact number",
          "Date of birth",
          "Gender",
          "PAN card number",
          "Aadhaar number",
          "Bank account details",
        ],
      },
      { type: "h3", text: "Categories of Sensitive Personal Data or Information Collected" },
      {
        type: "p",
        text:
          "We may collect the following categories of SPDI, subject to your specific consent and in compliance with applicable laws:",
      },
      {
        type: "ul",
        items: [
          "Authentication credentials (passwords and PINs)",
          "Financial information including bank account details, credit card/debit card/other payment instrument details",
          "Identity verification documents including Aadhaar, Passport, Voter ID, PAN",
          "Biometric information (where required for verification purposes, with explicit consent)",
          "Health-related information (where relevant to service delivery)",
          "Information of children (persons below 18 years of age) — collected only with verifiable consent of their parent or guardian, as required under Section 9 of the DPDP Act, 2023",
        ],
      },
      { type: "h3", text: "Notification at the Time of Collection" },
      {
        type: "p",
        text:
          "At the time of collection of Personal Information or Sensitive Personal Data or Information, we shall notify the Data Principal of:",
      },
      {
        type: "p",
        text:
          "(a) The fact that Personal Information/Sensitive Personal Data or Information is being collected; (b) The purpose for which the Personal Information/Sensitive Personal Data or Information is being collected; and (c) The intended recipients of such Personal Information/Sensitive Personal Data or Information.",
      },
    ],
  },
  {
    id: "purpose",
    title: "Purpose of Collection and Usage",
    blocks: [
      {
        type: "p",
        text:
          "We use the Personal Information we collect, where it is necessary to deliver the services you have requested, where it is necessary to exercise or comply with legal rights or obligations, or for normal business purposes of the kind set out in this Policy.",
      },
      {
        type: "p",
        text:
          "We will use your Personal Information to provide, analyse, administer, and improve our services, to provide you with a personalized experience on our Website.",
      },
      {
        type: "p",
        text:
          "We further use your Personal Information to communicate with you concerning our service (for example by email, push notifications, text messaging, and online messaging channels), so that we can send you details about new features and content available on the Website, special offers, promotional announcements, surveys, and to assist you with operational requests such as password reset requests.",
      },
      {
        type: "p",
        text:
          "If you are an employee, we use your Personal Information for purposes of payrolling and recording attendance, deduction of taxes, payment of remuneration, providing employee benefits (including making contributions to the provident fund, procuring medical insurance, etc.).",
      },
      {
        type: "p",
        text:
          "If you are a vendor/supplier, we use your Personal Information for the purpose of making payments and deducting taxes.",
      },
      { type: "h3", text: "Specific Purposes for Which Personal Information is Collected and Processed" },
      {
        type: "table",
        head: ["Sr. No.", "Category of Data", "Purpose of Processing"],
        rows: [
          ["1.", "Contact Information", "Account creation, communication, service delivery"],
          ["2.", "Identity Verification Documents", "KYC compliance, fraud prevention, regulatory requirements"],
          ["3.", "Billing/Financial Information", "Payment processing, subscription management, tax compliance"],
          ["4.", "Educational Records (mark-sheets)", "Course eligibility assessment, certification"],
          ["5.", "Usage Data and Preferences", "Service personalization, content improvement"],
          ["6.", "Employee Data", "Payroll, attendance, tax deduction, employee benefits"],
          ["7.", "Vendor/Supplier Data", "Payment processing, tax deduction (TDS), contract management"],
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "Retention of Information",
    blocks: [
      {
        type: "p",
        text:
          "We will retain your Personal Information only for as long as is necessary to fulfill the purpose for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.",
      },
      { type: "h3", text: "Specific Retention Periods" },
      {
        type: "ul",
        items: [
          "User Account Data: Retained for the duration of your account being active and for a period of 3 (three) years after account deletion, or such longer period as may be required under applicable law.",
          "Financial/Transaction Data: Retained for a minimum period of 8 (eight) years from the date of transaction as required under tax and corporate laws.",
          "Employee Data: Retained for the duration of employment and a period of 7 (seven) years after separation, or such longer period as required under applicable labour and tax laws.",
          "Identity Verification Data: Retained only for the period necessary to fulfill the purpose of verification and as required under applicable law.",
        ],
      },
      {
        type: "p",
        text:
          "Upon expiry of the retention period, your Personal Information shall be deleted or anonymized in a manner that it can no longer be attributed to you.",
      },
    ],
  },
  {
    id: "disclosure",
    title: "Disclosure of Information",
    blocks: [
      {
        type: "p",
        text:
          "We do not sell, transfer, or rent your Personal Information to third parties for their marketing purposes without your explicit consent, and we only use your information as described in the Privacy Policy. We view protection of your privacy as a very important community principle. We understand clearly that you and your Personal Information is one of our most important assets.",
      },
      {
        type: "p",
        text:
          "We store and process your Personal Information on computers located in India that are protected by physical as well as technological security devices. We use third parties to verify and certify our privacy principles. If you object to your Personal Information being transferred or used in this way, please do not accept this Privacy Policy.",
      },
      {
        type: "p",
        text:
          "Under no circumstances, we rent, trade, transfer, or share your Personal Information that we have collected with any other company for their marketing purposes without your consent. We reserve the right to communicate your Personal Information to any third party that makes a legally compliant request for its disclosure.",
      },
      { type: "h3", text: "Disclosure to Third Parties" },
      {
        type: "p",
        text:
          "We shall not disclose your Sensitive Personal Data or Information to any third party without obtaining your prior permission, except:",
      },
      {
        type: "p",
        text:
          "(a) Where such disclosure is necessary for compliance of a legal obligation; (b) Where such disclosure is necessary for the performance of a contract to which you are a party; (c) Where you have expressly consented to such disclosure; or (d) Where such disclosure is necessary for the delivery of services you have requested.",
      },
      { type: "h3", text: "Categories of Third Parties to Whom Disclosure May Be Made" },
      {
        type: "ul",
        items: [
          "Government authorities and law enforcement agencies (as required by law)",
          "Payment gateway providers and banks (for processing payments)",
          "Cloud service providers and data hosting services",
          "Analytics and marketing service providers",
          "Auditors, consultants, and professional advisors",
          "Affiliated entities and group companies",
        ],
      },
      { type: "h3", text: "Cross-Border Transfer" },
      {
        type: "p",
        text:
          "We shall not transfer your Personal Information outside India, except with your explicit consent and subject to compliance with applicable laws, including Section 16 of the DPDP Act, 2023, and any restrictions notified by the Central Government regarding cross-border data transfer.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      { type: "p", text: "We shall try to take all precautions to protect the Personal Information both online and offline." },
      {
        type: "p",
        text:
          "We will try to protect your information using technical and administrative security measures to reduce the risks of loss, misuse, unauthorized access, disclosure, and alteration. We have standard SSL certification which basically helps us create a secure connection between our server and user to render any information or action. Some of the safeguards we use are firewalls and data encryption, physical access controls to our data centers, and information access authorization controls. Only user passwords are encrypted in 64-bit encryption and stored because generally users use the same password on multiple sites, to prevent any kind of theft, piracy, or unauthorized access. If you believe your account has been abused or hacked, please contact us by sending us an email at ",
        email: SUPPORT_EMAIL,
      },
      { type: "h3", text: "Reasonable Security Practices and Procedures" },
      {
        type: "p",
        text:
          "We have implemented reasonable security practices and procedures as required under Rule 8 of the SPDI Rules, 2011, which include:",
      },
      {
        type: "p",
        text:
          "(a) Technical safeguards: SSL/TLS encryption, firewalls, intrusion detection systems, data encryption at rest and in transit, access controls, and authentication mechanisms; (b) Physical safeguards: Physical access controls to data centers, secure storage of physical records, and restricted access to premises; (c) Administrative safeguards: Information access authorization controls, employee training on data protection, confidentiality obligations, and periodic security audits; (d) Compliance with industry standards: Our security practices are aligned with ISO/IEC 27001 standards or such other industry standards as may be applicable.",
      },
      {
        type: "p",
        text:
          "We may, from time to time, review and update our security practices to ensure continued compliance with applicable laws and industry best practices.",
      },
      { type: "h3", text: "Data Breach Notification" },
      { type: "p", text: "In the event of a personal data breach, we shall:" },
      {
        type: "p",
        text:
          "(a) Take immediate steps to contain and mitigate the breach; (b) Notify the Data Protection Board of India and affected Data Principals in accordance with Section 8 of the DPDP Act, 2023, and the DPDP Rules, 2025; (c) Maintain records of all data breaches and remedial actions taken.",
      },
    ],
  },
  {
    id: "keeping-secure",
    title: "Keeping Your Personal Information Secure",
    blocks: [
      {
        type: "p",
        text:
          "We have appropriate security measures to prevent your Personal Information from being accidentally lost or used or accessed unlawfully. Processing your Personal Information will be done only in an authorized manner and subject to a duty of confidentiality. We also have procedures in place to deal with any suspected data security breach. We will notify you about any applicable regulator of a suspected data security breach where we are legally required to do so.",
      },
      {
        type: "p",
        text:
          "Notwithstanding anything contained anywhere in this Policy, we cannot assure absolute security to your Personal Information, and by entering or by logging into our Website, you explicitly agree not to sue us for any data breach, except in cases of gross negligence or willful misconduct on our part.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    blocks: [
      {
        type: "p",
        text:
          'Our Website uses "Cookies" to identify the areas of our Website that you have visited. A Cookie is a small piece of data stored on your computer or mobile device by your web browser. We use Cookies to personalize the Content that you see on our Website. Most web browsers can be set to disable the use of Cookies. We never place Personally Information in Cookies.',
      },
      { type: "h3", text: "Types of Cookies Used" },
      {
        type: "ul",
        items: [
          "Strictly Necessary Cookies: Essential for the operation of the Website",
          "Performance Cookies: To analyze Website usage and improve performance",
          "Functionality Cookies: To remember user preferences and settings",
          "Targeting/Advertising Cookies: To deliver relevant advertisements (with consent)",
        ],
      },
      {
        type: "p",
        text:
          "You may manage your cookie preferences through your browser settings or through our cookie consent banner.",
      },
    ],
  },
  {
    id: "choice",
    title: "Choice and Opt-Out",
    blocks: [
      {
        type: "p",
        text:
          "It is open for you to customize our usage of your personal information to communicate with you, to send you marketing information, how we provide you with customized and relevant advertising, and whether you want to stay signed into your account.",
      },
      {
        type: "p",
        text:
          "If you do not wish to receive marketing communications from us, you can unsubscribe from the link in the email you would receive or change your communication preferences or indicate your communication preferences.",
      },
      {
        type: "p",
        text:
          "You can also reach us via chat, WhatsApp, call, or email to block promotional communication to you. Keep in mind, we do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights as a Data Principal",
    blocks: [
      {
        // The source document leaves the withdrawal address blank ("[ ]").
        // Using the support address the same document designates for exercising
        // rights, rather than inventing a new one.
        type: "p",
        text:
          "You have the right to withdraw your consent at any time in writing by sending an e-mail to us at ",
        email: SUPPORT_EMAIL,
        after:
          ", in accordance with the terms of this Privacy Policy. However, please note that withdrawal of consent will not be retrospective in nature and shall be applicable prospectively.",
      },
      {
        type: "p",
        text:
          "You agree and acknowledge that Your right to access, modify and/or withdraw consent to provide Personal Information as mentioned above may be denied or limited by us, as may be required under any applicable law, law enforcement requests, or under any judicial proceedings.",
      },
      { type: "h3", text: "Rights Under the DPDP Act, 2023" },
      {
        type: "p",
        text:
          "As a Data Principal, you have the following rights under the Digital Personal Data Protection Act, 2023:",
      },
      {
        type: "table",
        head: ["Sr. No.", "Right", "Description"],
        rows: [
          ["1.", "Right to Access", "To obtain a summary of your Personal Information being processed and related information"],
          ["2.", "Right to Correction", "To correct, complete, or update your Personal Information"],
          ["3.", "Right to Erasure", "To request deletion of your Personal Information, subject to legal obligations"],
          ["4.", "Right to Withdraw Consent", "To withdraw consent at any time, with prospective effect"],
          ["5.", "Right to Grievance Redressal", "To file a complaint with our Grievance Officer"],
          ["6.", "Right to Nominate", "To nominate another individual to exercise your rights in case of death or incapacity"],
        ],
      },
      { type: "h3", text: "Manner of Exercising Rights" },
      { type: "p", text: "To exercise any of the above rights, you may:" },
      {
        type: "p",
        text: "(a) Send a written request to our Grievance Officer at the contact details provided below; (b) Email us at ",
        email: SUPPORT_EMAIL,
        after: "; (c) Use the in-app/website settings to manage your preferences.",
      },
      {
        type: "p",
        text:
          "We shall respond to your request within 30 (thirty) days of receipt, or such extended period as may be permitted under applicable law.",
      },
      { type: "h3", text: "Right to File Complaint with Data Protection Board" },
      {
        // The source document has "[Insert DPB Complaint Portal Link]" here.
        // No URL is published in its place rather than guessing at one.
        type: "p",
        text:
          "If you are not satisfied with our response to your grievance, you may file a complaint with the Data Protection Board of India.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    blocks: [
      {
        type: "p",
        text:
          "We do not knowingly collect Personal Information from children below 18 years of age without verifiable consent from their parent or guardian, as required under Section 9 of the DPDP Act, 2023.",
      },
      {
        type: "p",
        text:
          "If we become aware that we have collected Personal Information from a child without verifiable parental consent, we shall delete such information within a reasonable period.",
      },
      {
        type: "p",
        text:
          "Parents and guardians may contact our Grievance Officer to review, modify, or delete any Personal Information collected from their child.",
      },
    ],
  },
  {
    id: "ownership",
    title: "Ownership of Rights",
    blocks: [
      {
        type: "p",
        text:
          "All rights of this Website are owned by or licensed to us. Any use of this Website or its contents, including copying or storing it or them in whole or part, other than for your own personal, non-commercial use is prohibited without our permission. You are prohibited from modifying, copying, distributing, transmitting, displaying, printing, publishing, selling, licensing, creating derivative works, or using any content available on or through our Website for commercial or public purposes.",
      },
      {
        type: "p",
        text:
          "You shall be solely liable for any damage resulting from any infringement of proprietary rights or any other harm resulting from such a submission. By submitting material to any public area of the Website, you warrant that the owner of such material has expressly granted Apokryfon the royalty-free, perpetual, irrevocable, non-exclusive right and license to use, reproduce, modify, adapt, and distribute such material. You also permit any other end user to access, view, store, or reproduce the material for that end user's personal use. If you come across any abuse or violation of these Terms, please report to ",
        email: SUPPORT_EMAIL,
        after: ".",
      },
    ],
  },
  {
    id: "conditions",
    title: "Conditions of Use",
    blocks: [
      {
        type: "p",
        text:
          "Licensee does not warrant that this Website, its servers, or email sent by us or on our behalf are virus free. We will not be liable for any damages of any kind arising from the use of this Website, including, but not limited to compensatory, direct, indirect, incidental, punitive, special, or consequential damages, loss of data, goodwill, business opportunity, income or profit, loss of or damage to property and claims of third parties.",
      },
    ],
  },
  {
    id: "grievance",
    title: "Grievance Officer and Data Protection Officer",
    blocks: [
      {
        type: "p",
        text:
          "Any discrepancies and grievances with respect to processing of Personal Information shall be informed to the designated Grievance Officer as mentioned below:",
      },
      {
        type: "contact",
        name: "Yadu Aravind Menon",
        designation: "Founder Director / Grievance Officer",
        email: GRIEVANCE_EMAIL,
        note:
          "We shall respond to your grievance within 30 (thirty) days of receipt, as required under Rule 5(9) of the SPDI Rules, 2011, and within 90 (ninety) days as required under the DPDP Rules, 2025.",
      },
    ],
  },
  {
    id: "consent",
    title: "Consent to the Policy",
    blocks: [
      { type: "p", text: "The Terms of Use Agreement is incorporated herein by reference in its entirety." },
      {
        type: "p",
        text:
          "By using our Website and providing your Personal Information, you expressly consent to the collection, storage, use, processing, sharing, and transfer of your Personal Information in accordance with this Privacy Policy.",
      },
    ],
  },
  {
    id: "general",
    title: "General",
    blocks: [
      { type: "h3", text: "Modification" },
      {
        type: "p",
        text:
          "We may at any time modify the Terms of Use and this Privacy Policy of our Website. We shall notify you of any material changes to this Privacy Policy through email, in-app notifications, or a prominent notice on our Website at least 15 (fifteen) days before the changes take effect. Should you wish to terminate your account due to a modification to the Terms or the Privacy Policy, you may do so by emailing us at ",
        email: SUPPORT_EMAIL,
        after:
          ". However, if you continue to use the service, you shall be deemed to have agreed to accept and abide by the modified Terms of this Website.",
      },
      { type: "h3", text: "Apokryfon May Disclose Information" },
      {
        type: "ul",
        items: [
          "As required by law, such as to comply with a subpoena, or similar legal process;",
          "To enforce applicable ToU (Terms of Use), including investigation of potential violations thereof;",
          "When we believe in good faith (doctrine of uberrima fides) that the disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, address security or technical issues, or respond to a government request;",
          "With our trusted service providers who work on our behalf and do not have an independent use of the information we disclose to them and have agreed to and adhered to the rules set forth in this Policy;",
          "To protect against imminent harm to the rights, property, or safety of the Application/Website or our users or the public as required or permitted by law;",
          "With third-party service providers in order to personalize the Application/Website/Services/products for a better user experience and to perform behavioral analysis;",
          "Internally with the relevant departments to facilitate payments of salary, deduction of taxes, procuring medical insurance, etc.",
        ],
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law and Jurisdiction",
    blocks: [
      {
        type: "p",
        text:
          "In the event of any dispute arising between the parties with respect to this Agreement, the same shall be referred to the Sole Arbitrator and the arbitration shall be in accordance with the Arbitration and Conciliation Act of 1996. The language of arbitration proceedings shall be English. The seat and place of arbitration shall be Bangalore, and the decision of the Arbitrator shall be final and binding on both parties herein.",
      },
      {
        type: "p",
        text:
          "This contract shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka, India and shall be governed by the Indian laws, including the Information Technology Act, 2000, the SPDI Rules, 2011, the Digital Personal Data Protection Act, 2023, and the DPDP Rules, 2025, as applicable and amended from time to time.",
      },
    ],
  },
];

function MailLink({ address }) {
  return (
    <a
      href={`mailto:${address}`}
      className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700 hover:decoration-blue-500 break-words"
    >
      {address}
    </a>
  );
}

function Block({ block }) {
  if (block.type === "h3") {
    return (
      <h3 className="mt-8 mb-3 font-display text-base sm:text-lg font-bold text-slate-900">
        {block.text}
      </h3>
    );
  }

  if (block.type === "ul") {
    return (
      <ul className="my-4 space-y-2.5 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed text-slate-700">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="my-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-collapse overflow-hidden rounded-xl border border-slate-200 text-left">
          <thead>
            <tr className="bg-slate-50">
              {block.head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="border-b border-slate-200 px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r} className="odd:bg-white even:bg-slate-50/60">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`border-b border-slate-100 px-4 py-3 align-top text-sm leading-relaxed ${
                      c === 0 ? "whitespace-nowrap font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "contact") {
    return (
      <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <dl className="space-y-3 text-sm sm:text-base">
          <div className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="w-40 flex-shrink-0 font-display text-xs font-bold uppercase tracking-wider text-slate-500 sm:pt-0.5">
              Name
            </dt>
            <dd className="font-semibold text-slate-900">{block.name}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="w-40 flex-shrink-0 font-display text-xs font-bold uppercase tracking-wider text-slate-500 sm:pt-0.5">
              Designation
            </dt>
            <dd className="text-slate-700">{block.designation}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="w-40 flex-shrink-0 font-display text-xs font-bold uppercase tracking-wider text-slate-500 sm:pt-0.5">
              Email
            </dt>
            <dd>
              <MailLink address={block.email} />
            </dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-3">
            <dt className="w-40 flex-shrink-0 font-display text-xs font-bold uppercase tracking-wider text-slate-500 sm:pt-0.5">
              Response Timeline
            </dt>
            <dd className="text-slate-700">{block.note}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <p className="my-4 text-sm sm:text-base leading-relaxed text-slate-700">
      {block.text}
      {block.email && <MailLink address={block.email} />}
      {block.after}
    </p>
  );
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
          >
            <MdArrowBack className="text-lg" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Truesight" className="h-7 w-auto" />
            <span className="font-display text-sm font-bold tracking-tight text-slate-900">TRUESIGHT</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Title */}
        <div className="mb-10 border-b border-slate-100 pb-8">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">
            Truesight Student Platform
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            How Apokryfon Private Limited collects, stores, uses, shares, processes, and protects your
            personal information on truesight.community.
          </p>
          <p className="mt-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Last updated{" "}
              <time dateTime={LAST_UPDATED_ISO} className="text-slate-700">
                {LAST_UPDATED}
              </time>
            </span>
          </p>
        </div>

        <div className="lg:flex lg:gap-12">
          {/* Contents */}
          <nav
            aria-label="Table of contents"
            className="mb-10 flex-shrink-0 lg:sticky lg:top-8 lg:mb-0 lg:h-fit lg:w-60"
          >
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Contents
            </p>
            <ol className="space-y-1.5">
              {SECTIONS.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 rounded-md py-1 text-sm text-slate-600 transition-colors hover:text-blue-600"
                  >
                    <span className="w-4 flex-shrink-0 text-right text-xs text-slate-400">{i + 1}</span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Body */}
          <div className="min-w-0 flex-1">
            {SECTIONS.map((section, i) => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-8">
                <h2 className="mb-4 flex items-baseline gap-3 font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  <span className="text-base font-bold text-blue-500">{i + 1}.</span>
                  {section.title}
                </h2>
                {section.blocks.map((block, b) => (
                  <Block key={b} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white px-8 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            © 2026 Truesight Student Platform
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Contact Us
          </button>
        </div>
      </footer>
    </div>
  );
}
