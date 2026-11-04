/* =====================================================================
 * PROCARE NURSING — SITE CONFIG (single source of truth)
 * ---------------------------------------------------------------------
 * This is the ONLY file you need to edit to change business details.
 * No HTML or layout changes are required — main.js reads these values
 * and writes them into the page on load.
 *
 * HOW TO EDIT:
 *   • Change the text inside the quotes "like this".
 *   • Keep the quotes and the commas.
 *   • To add/remove a suburb, add/remove a "line", in the suburbs list.
 *
 * Anything marked  TODO  must be filled in with a real value before the
 * website goes live. See README.md for the pre-launch checklist.
 * ===================================================================== */

export const SITE = {
  /* ---- Business identity ------------------------------------------ */
  business: {
    name: 'Procare Nursing', // Brand name shown across the site
    legalName: 'Procare Nursing Pty Ltd', // TODO confirm the registered legal entity name
    abn: '59 698 156 964',
    domain: 'procarenursing.com.au',
  },

  /* ---- Contact details -------------------------------------------- */
  contact: {
    // Phone shown on screen (format however you like to read it):
    phone: '0414 013 602',
    // Same number for the tap-to-call link, in +61 international form,
    // digits only after the plus (no spaces). e.g. 0414013602 -> +61414013602
    phoneHref: '+61414013602',
    intakeEmail: 'intake@procarenursing.com.au', // referrals and enquiries
    feedbackEmail: 'intake@procarenursing.com.au', // feedback and complaints
    // WhatsApp number in international form, digits only (no +, no spaces).
    // e.g. 0414013602 -> 61414013602. Leave '' to hide WhatsApp buttons.
    whatsapp: '61414013602',
    // Pre-filled WhatsApp message (optional):
    whatsappMessage: 'Hi Procare Nursing, I have an enquiry about in-home nursing.',
    // How quickly you acknowledge a referral (shown in the Refer section):
    acknowledgeTime: 'within 1 business day',
  },

  /* ---- Hours & availability --------------------------------------- */
  hours: {
    phone: 'Mon to Fri, 8:00am to 6:00pm', // phone line hours
    service: 'Scheduled home visits 7 days a week', // when visits happen
    // After-hours guidance for existing clients (NOT for emergencies):
    afterHours:
      'For urgent clinical concerns outside phone hours, call our intake line ' +
      'and follow the prompts. For a medical emergency, always call 000.',
  },

  /* ---- Suburbs served (Greater Sydney) ----------------------------
   * Edit this list freely — add or remove suburbs as your service area
   * changes. They appear as chips in the "Care we provide" section.
   * ----------------------------------------------------------------- */
  suburbs: [
    'Sydney CBD',
    'Parramatta',
    'Blacktown',
    'Liverpool',
    'Bankstown',
    'Penrith',
    'Hornsby',
    'Chatswood',
    'Sutherland',
    'Campbelltown',
    'Bondi Junction',
    'Manly',
    'Ryde',
    'Auburn',
    'Castle Hill',
    'Hurstville',
  ],

  /* ---- Official DVA links (open in a new tab) ---------------------
   * Verify both URLs against https://dva.gov.au before launch.
   * ----------------------------------------------------------------- */
  links: {
    // Official DVA D9389 Community Nursing referral form:
    d9389: 'https://www.dva.gov.au/', // TODO replace with the exact D9389 form URL
    // DVA Community Nursing Client Charter:
    clientCharter: 'https://www.dva.gov.au/', // TODO replace with the exact Charter URL
  },

  /* ---- Callback form backend -------------------------------------
   * provider: 'formspree'  -> works on GitHub Pages (default)
   * provider: 'netlify'    -> only when hosting on Netlify
   * If using Formspree, create a form and paste its ID below
   * (the part after /f/ in your Formspree endpoint URL).
   * ----------------------------------------------------------------- */
  form: {
    provider: 'formspree', // 'formspree' | 'netlify'
    formspreeId: '', // TODO e.g. 'xyzabcde' when provider is 'formspree'
  },
};

// Expose on window so plain (non-module) scripts and inline fallbacks can read it.
if (typeof window !== 'undefined') {
  window.SITE = SITE;
}
