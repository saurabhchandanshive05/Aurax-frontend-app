// Public contact phone / WhatsApp number, from the build environment (never hard-coded).
// Set REACT_APP_CONTACT_PHONE (and optionally REACT_APP_CONTACT_WHATSAPP) in the hosting
// environment, international format, e.g. +91XXXXXXXXXX. When unset, the phone and WhatsApp
// entries are simply not shown.
const clean = (v) => String(v || "").replace(/[^\d+]/g, "");

const phone = clean(process.env.REACT_APP_CONTACT_PHONE);
const whatsapp = clean(process.env.REACT_APP_CONTACT_WHATSAPP) || phone;

export const CONTACT_PHONE = phone || null; // e.g. "+91XXXXXXXXXX"
export const CONTACT_PHONE_LABEL = process.env.REACT_APP_CONTACT_PHONE_LABEL || phone || null;
export const CONTACT_TEL_URL = phone ? `tel:${phone}` : null;
export const CONTACT_WHATSAPP_URL = whatsapp ? `https://wa.me/${whatsapp.replace(/^\+/, "")}` : null;
