// Editable defaults for the Inquire page form. Every label, placeholder, and
// message reads from the CMS using these keys, falling back to the text here
// until an admin overrides it in the backend.

export const INQUIRE_FORM = {
  fullName: {
    labelKey: "inquire.form.fullName.label",
    label: "Full name",
    placeholderKey: "inquire.form.fullName.placeholder",
    placeholder: "John Smith",
  },
  organization: {
    labelKey: "inquire.form.organization.label",
    label: "Organization",
    placeholderKey: "inquire.form.organization.placeholder",
    placeholder: "Acme Corporation",
  },
  title: {
    labelKey: "inquire.form.title.label",
    label: "Title",
    placeholderKey: "inquire.form.title.placeholder",
    placeholder: "Chief Executive Officer",
  },
  email: {
    labelKey: "inquire.form.email.label",
    label: "Email",
    placeholderKey: "inquire.form.email.placeholder",
    placeholder: "john@company.com",
    descriptionKey: "inquire.form.email.description",
    description: "A corporate email helps us verify and respond faster.",
  },
  linkedin: {
    labelKey: "inquire.form.linkedin.label",
    label: "LinkedIn profile (optional)",
    placeholderKey: "inquire.form.linkedin.placeholder",
    placeholder: "https://linkedin.com/in/username",
  },
  arrival: {
    labelKey: "inquire.form.arrival.label",
    label: "Estimated arrival",
  },
  departure: {
    labelKey: "inquire.form.departure.label",
    label: "Estimated departure",
  },
  datePlaceholder: {
    key: "inquire.form.date.placeholder",
    text: "Select a date",
  },
  flexible: {
    labelKey: "inquire.form.flexible.label",
    label: "My dates are flexible",
  },
  partySize: {
    labelKey: "inquire.form.partySize.label",
    label: "Party size (optional)",
    placeholderKey: "inquire.form.partySize.placeholder",
    placeholder: "e.g. 3",
  },
  interests: {
    labelKey: "inquire.form.interests.label",
    label: "Areas of interest",
    descriptionKey: "inquire.form.interests.description",
    description:
      "Select all that apply. We will tailor your itinerary accordingly.",
  },
  objectives: {
    labelKey: "inquire.form.objectives.label",
    label: "Your objectives",
    placeholderKey: "inquire.form.objectives.placeholder",
    placeholder:
      "Tell us what you hope to accomplish during your visit — the meetings, relationships, or outcomes that matter most.",
  },
  privacy: {
    key: "inquire.form.privacy.text",
    text: "I understand that everything I share is held in strict confidence and used solely to prepare my visit. Bizlegate never discloses client details to third parties.",
  },
  submit: {
    key: "inquire.form.submit.label",
    text: "Submit inquiry",
  },
};

export const INQUIRE_SUCCESS = {
  title: {
    key: "inquire.success.title",
    text: "Thank you.",
  },
  body: {
    key: "inquire.success.body",
    text: "Your inquiry has been received in confidence. A member of our team will respond personally within one business day.",
  },
};
