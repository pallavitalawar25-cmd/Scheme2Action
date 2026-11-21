export default {
  // validation
  'v.required': 'This field is required', 'v.name': 'Enter your full name (at least 2 letters)', 'v.email': 'Enter a valid email address',
  'v.username': 'Use 3–20 letters, numbers, dots or underscores', 'v.passwordLen': 'Use at least 8 characters', 'v.passwordMix': 'Include at least one letter and one number',
  'v.match': 'Passwords do not match', 'v.consent': 'You need to agree to continue', 'v.phone': 'Enter a 10-digit mobile number',
  'v.pincode': 'Enter a 6-digit PIN code', 'v.date': 'Enter a valid date of birth',

  // auth
  'auth.login.sub': 'Log in to continue your applications.', 'auth.identifier': 'Email or username', 'auth.password': 'Password', 'auth.confirmPassword': 'Confirm password',
  'auth.show': 'Show password', 'auth.hide': 'Hide password', 'auth.remember': 'Remember me on this device', 'auth.forgot': 'Forgot password?',
  'auth.loginBtn': 'Log in', 'auth.noAccount': 'New to Scheme2Action?', 'auth.createAccount': 'Create account', 'auth.haveAccount': 'Already have an account?',
  'auth.or': 'or explore with the demo', 'auth.demoHint': 'Quick access skips the password and opens sample data.',
  'auth.error.invalid': 'The email or username, or the password, is not correct.', 'auth.error.network': 'Something went wrong. Please try again.',
  'auth.error.emailTaken': 'An account with this email already exists.', 'auth.error.usernameTaken': 'This username is taken.',
  'auth.demo.title': 'Demonstration sign-in', 'auth.demo.body': 'Accounts are stored only in this browser. This is not secure authentication and must not be used with real passwords or personal data. A real server-side login replaces it when the backend is connected.',
  'auth.register.title': 'Create your account', 'auth.register.sub': 'Free to use. Takes about a minute.',
  'auth.fullName': 'Full name', 'auth.email': 'Email', 'auth.username': 'Username', 'auth.username.hint': '3–20 characters: letters, numbers, dot or underscore.',
  'auth.password.hint': 'At least 8 characters with a letter and a number.', 'auth.strength': 'Password strength', 'auth.strength.weak': 'Weak', 'auth.strength.fair': 'Fair', 'auth.strength.strong': 'Strong',
  'auth.consent': 'I agree to the Terms and Privacy notice', 'auth.consent.note': 'Demo build: nothing you enter leaves this browser.',
  'auth.forgot.title': 'Reset your password', 'auth.forgot.sub': 'Enter the email you registered with.', 'auth.forgot.send': 'Send reset link',
  'auth.forgot.demo': 'Demo only: no email is sent. Real password recovery by email needs the backend.',
  'auth.forgot.sent.title': 'Check your email', 'auth.forgot.sent.body': 'If an account exists for {email}, a reset link would be sent. (Demo: nothing was sent.)', 'auth.backToLogin': 'Back to login',
  'toast.welcome': 'Welcome back, {name}', 'toast.accountCreated': 'Account created (demo)', 'common.saving': 'Saving…',

  // nav
  'nav.saved': 'Saved Schemes', 'nav.settings': 'Settings',

  // dashboard
  'dash.welcome': 'Welcome, {name}', 'dash.sub': 'Here is where your applications stand.', 'dash.demoNote': 'Dashboard figures come from demonstration data stored in this browser.',
  'dash.stat.active': 'Active applications', 'dash.stat.saved': 'Saved schemes', 'dash.stat.docs': 'Pending documents', 'dash.stat.corrections': 'Pending corrections', 'dash.stat.packets': 'Completed packets',
  'dash.apps.title': 'Active applications', 'dash.apps.empty.title': 'No active applications yet', 'dash.apps.empty.desc': 'Pick a scheme and check your eligibility to start preparing.', 'dash.apps.start': 'Find a scheme',
  'dash.continue': 'Continue application', 'dash.viewPacket': 'View packet', 'dash.progress': '{percent}% prepared', 'dash.stage': 'Current step', 'dash.packetReady': 'Packet ready',
  'dash.pendingDocs': '{count} documents pending', 'dash.pendingCorr': '{count} to correct',
  'dash.tasks.title': 'Pending tasks', 'dash.tasks.empty': 'You are all caught up.', 'task.upload': 'Upload {doc}', 'task.correct': 'Review and correct {doc}', 'task.profile': 'Complete your profile', 'task.for': 'For {scheme}',
  'dash.timeline.title': 'Application journey', 'dash.timeline.note': 'Platform preparation progress only. Government processing is tracked separately in the Action Tracker.',
  'dash.saved.title': 'Saved schemes', 'dash.saved.empty.title': 'No saved schemes yet', 'dash.saved.empty.desc': 'Tap the bookmark on any scheme to keep it here.', 'dash.viewAll': 'View all',
  'dash.activity.title': 'Recent activity', 'dash.activity.empty': 'No activity yet.',
  'act.saved': 'Saved {scheme}', 'act.started': 'Started preparing {scheme}', 'act.uploaded': 'Uploaded {doc} for {scheme}', 'act.eligibility': 'Completed the eligibility check for {scheme}', 'act.joined': 'Created your account',
  'act.helperStart': 'Started a helper session', 'act.helperEnd': 'Ended the helper session', 'act.profile': 'Updated your profile',
  'dash.profile.complete': '{percent}% complete', 'dash.profile.edit': 'Edit profile', 'dash.profile.missing': 'Add the missing details to speed up eligibility checks.',
  'docstatus.missing': 'Not uploaded', 'docstatus.uploaded': 'Uploaded', 'docstatus.needs-correction': 'Needs correction', 'docstatus.confirmed': 'Confirmed by you',

  // saved
  'saved.desc': 'Schemes you have bookmarked on this device.', 'saved.count': '{count} saved', 'saved.clear': 'Remove all', 'saved.confirm.title': 'Remove all saved schemes?', 'saved.confirm.body': 'This only affects this browser and cannot be undone.', 'saved.cleared': 'Saved schemes cleared',

  // profile
  'profile.desc': 'Keep your details up to date so eligibility checks start faster.', 'profile.personal': 'Personal information', 'profile.phone': 'Mobile number', 'profile.dob': 'Date of birth',
  'profile.gender': 'Gender', 'gender.female': 'Female', 'gender.male': 'Male', 'gender.other': 'Other', 'gender.na': 'Prefer not to say', 'profile.select': 'Select',
  'profile.state': 'State', 'profile.district': 'District', 'profile.pincode': 'PIN code', 'profile.occupation': 'Occupation',
  'occ.student': 'Student', 'occ.farmer': 'Farmer', 'occ.homemaker': 'Homemaker', 'occ.employed': 'Employed', 'occ.self': 'Self-employed', 'occ.unemployed': 'Unemployed', 'occ.retired': 'Retired',
  'profile.save': 'Save changes', 'profile.saved': 'Profile saved (demo)', 'profile.completeness': 'Profile completeness', 'profile.why': 'This information is used only to pre-fill eligibility questions. You stay in control of every answer.',
  'profile.emailLocked': 'Email comes from your account.', 'profile.docs.title': 'My documents', 'profile.docs.desc': 'Demonstration list. Files are not stored on a server.', 'profile.docs.empty': 'No documents yet', 'profile.docs.remove': 'Remove',
  'toast.docRemoved': 'Document removed from this demo list', 'profile.toSettings': 'Account settings',

  // settings
  'settings.desc': 'Language, accessibility, notifications and privacy.', 'settings.language': 'Preferred language', 'settings.language.note': 'This is the same language setting as the selector in the top bar.',
  'settings.access': 'Accessibility', 'settings.textSize': 'Text size', 'size.normal': 'Normal', 'size.large': 'Large', 'size.xl': 'Extra large',
  'settings.reduceMotion': 'Reduce motion', 'settings.reduceMotion.desc': 'Turns off most animations.',
  'settings.notifications': 'Notifications', 'notif.email': 'Email updates about my applications', 'notif.sms': 'SMS reminders', 'notif.policy': 'Alerts when a saved scheme changes',
  'settings.notifications.note': 'Preferences are saved here. Sending notifications needs the backend.',
  'settings.privacy': 'Privacy', 'privacy.ai': 'Allow AI to read my uploaded documents', 'privacy.ai.desc': 'Needed for document review. You can still enter details by hand.', 'privacy.helper': 'Allow helpers to assist me when I consent',
  'settings.account': 'Account', 'account.username': 'Username', 'account.email': 'Email', 'account.mode.demo': 'Demo account (stored in this browser only)', 'account.mode.api': 'Account', 'account.resetDemo': 'Reset sample data', 'account.delete': 'Delete this demo account',
  'account.delete.body': 'This removes the account and its data from this browser. This cannot be undone.', 'account.delete.confirm': 'Delete account',
  'toast.settingsSaved': 'Setting saved', 'toast.dataReset': 'Sample data restored', 'toast.accountDeleted': 'Demo account deleted',

  // helper intro
  'helper.intro.lead': 'Help a family member, neighbour or someone you volunteer with get application-ready, with their consent.', 'helper.start': 'Start a helper session',
  'helper.how.title': 'How Helper Mode works',
  'helper.step1.title': 'Confirm consent', 'helper.step1.desc': 'The citizen agrees to your help. You both confirm it on screen.',
  'helper.step2.title': 'Use simpler screens', 'helper.step2.desc': 'Larger text, big buttons and easy language switching.',
  'helper.step3.title': 'Prepare together', 'helper.step3.desc': 'Search schemes, answer questions and gather documents side by side.',
  'helper.principles.title': 'Our principles', 'helper.p1': 'The citizen decides. Every answer and correction stays theirs.', 'helper.p2': 'Helpers should never ask for passwords, OTPs or bank PINs.', 'helper.p3': 'Either person can end the session at any time.',
  'helper.noverify': 'Scheme2Action does not verify anyone’s identity in this demo. Consent here is a confirmation on screen, not a legal or identity check.',
  'helper.loginFirst': 'You will be asked to log in first. Helpers use their own account.',

  // helper workspace
  'hw.title': 'Citizen Assistance Workspace', 'hw.consent.title': 'Confirm consent first', 'hw.citizenName': 'Name of the person you are helping', 'hw.helperName': 'Your name (helper)',
  'hw.relationship': 'Your relationship', 'rel.family': 'Family member', 'rel.friend': 'Friend or neighbour', 'rel.volunteer': 'Volunteer', 'rel.other': 'Other',
  'hw.c1': 'The citizen has agreed that I may help them.', 'hw.c2': 'I will not ask for or use their passwords, OTPs or bank PINs.', 'hw.c3': 'The citizen knows they can stop the session at any time.',
  'hw.begin': 'Begin session', 'hw.err': 'Please confirm all three statements.', 'hw.active': 'Helper session active', 'hw.helping': 'You are helping {name}.', 'hw.end': 'End session',
  'hw.ended': 'Helper session ended', 'hw.started': 'Helper session started. Text size increased.', 'hw.since': 'Started {date}', 'hw.what': 'What would you like to do?',
  'hw.t.upload': 'Upload documents', 'hw.noApp': 'No application to continue yet', 'hw.display': 'Display and language', 'hw.demoNote': 'Demo: helper actions use this account’s sample data.',
  'hw.relationshipLabel': 'Helping as: {rel}', 'hw.banner': 'Helper session: helping {name}',

  // Batch 4 citizen application preparation
  'journey.subtitle': 'Citizen application preparation', 'journey.demoNotice': 'Demonstration workflow. Answers, files and progress are stored in this browser only; this is not government submission or verification.', 'journey.schemeMissing': 'This scheme could not be found.',
  'journey.eligibility.title': 'Eligibility questionnaire', 'journey.results.title': 'Eligibility assessment', 'journey.documents.title': 'Document checklist', 'journey.upload.title': 'Document upload', 'journey.review.title': 'Document review', 'journey.corrections.title': 'Your corrections', 'journey.final.title': 'Final preparation review', 'journey.packet.title': 'Preparation packet', 'journey.tracker.title': 'Citizen action tracker',
  'journey.rulesLabel': 'Configurable demonstration rules', 'journey.questionsTitle': 'A few questions about you', 'journey.questionsDesc': 'These sample questions demonstrate the flow. They are not official scholarship rules.', 'journey.demoQuestion': 'Demonstration question — confirm current requirements with the official source.',
  'journey.q.student': 'Are you currently a student?', 'journey.q.karnataka': 'Do you live in Karnataka?', 'journey.q.postMatric': 'Are you studying post-matriculation?', 'journey.q.incomeKnown': 'Can you provide household income information?', 'journey.answer.yes': 'Yes', 'journey.answer.no': 'No', 'journey.answer.unknown': 'Not sure / prefer not to say', 'journey.required': 'Answer the required questions to continue.', 'journey.save': 'Save progress',
  'journey.outcome.likely': 'Likely eligible (demo)', 'journey.outcome.not': 'Not eligible under these demo rules', 'journey.outcome.unknown': 'Needs verification', 'journey.outcomeDesc.likely': 'Your answers match the configured demonstration rules. This is not an official eligibility decision.', 'journey.outcomeDesc.not': 'At least one answer did not match the configured demonstration rules. Verify the current official requirements before deciding.', 'journey.outcomeDesc.unknown': 'The available answers and demonstration rules are not enough to determine an outcome.', 'journey.evaluated': 'Conditions evaluated', 'journey.ruleDisclaimer': 'Rules are configurable examples only. Scheme2Action does not decide or guarantee eligibility.',
  'journey.docTitle': 'Documents to prepare', 'journey.docDisclaimer': 'Sample checklist only. Requirements have not been confirmed as official.', 'journey.docDescription': 'Keep a clear, current copy available.', 'journey.docFormats': 'PDF, JPG or PNG', 'journey.doc.identity': 'Identity proof (only if required by the official portal)', 'journey.doc.income': 'Income certificate', 'journey.doc.marks': 'Previous marks card', 'journey.doc.admission': 'Admission proof', 'journey.doc.bank': 'Bank account proof', 'journey.doc.caste': 'Caste certificate (if applicable)', 'journey.mandatory': 'Sample mandatory', 'journey.optional': 'Sample optional', 'journey.missing': 'Missing', 'journey.uploaded': 'Uploaded', 'journey.manage': 'Manage',
  'journey.uploadTitle': 'Add sample documents', 'journey.uploadDisclaimer': 'Demonstration upload: files remain in browser storage and are not sent to a server. Avoid sensitive real documents.', 'journey.fileLimit': 'PDF/JPG/PNG · up to 5 MB', 'journey.upload.invalid': 'Choose a PDF, JPG or PNG file up to 5 MB.', 'journey.browse': 'Browse files', 'journey.replace': 'Replace file', 'journey.remove': 'Remove',
  'journey.reviewTitle': 'Assisted document review', 'journey.reviewDisclaimer': 'Example only. No document has been read or authenticated. AI extraction cannot verify certificates or detect forgery with certainty.', 'journey.reviewExample': 'Example: income certificate', 'journey.manual': 'Needs manual verification', 'journey.correctionsTitle': 'Review information carefully', 'journey.correctionsDesc': 'Original values remain unchanged. Add your own correction separately for your preparation notes.', 'journey.original': 'Original extracted value', 'journey.notAvailable': 'Not available in this demo', 'journey.correctedValue': 'Your corrected value (optional)', 'journey.saveCorrections': 'Save corrections', 'journey.correctionsSaved': 'corrections saved',
  'journey.finalTitle': 'Review your preparation', 'journey.finalDisclaimer': 'This is not a government application or submission. Apply through the official portal after checking its current instructions.', 'journey.confirm': 'I understand this is a preparation summary, not an official application or eligibility approval.', 'journey.preparePacket': 'Create preparation packet', 'journey.packetTitle': 'Your preparation summary', 'journey.packetDesc': 'Download a basic A4 PDF summary for your own reference. It is not a government certificate.', 'journey.packetContents': 'Includes this demonstration assessment, document checklist and preparation disclaimer.', 'journey.downloadPdf': 'Download PDF packet', 'journey.pdf.title': 'Scheme2Action — Citizen Preparation Packet', 'journey.pdf.date': 'Generated', 'journey.pdf.outcome': 'Demo eligibility assessment', 'journey.pdf.limitation': 'Demonstration only. Not an official decision.', 'journey.pdf.docs': 'Document checklist:', 'journey.pdf.disclaimer': 'Independent assistance platform — not a government website or approval authority.',
  'journey.trackerTitle': 'Preparation progress', 'journey.trackerDisclaimer': 'This timeline tracks preparation in Scheme2Action only. It does not track government application processing.', 'journey.track.discovered': 'Scheme discovered', 'journey.track.eligibility': 'Questionnaire completed', 'journey.track.assessment': 'Eligibility assessed', 'journey.track.documents': 'Documents prepared', 'journey.track.review': 'Document review', 'journey.track.corrections': 'Corrections completed', 'journey.track.final': 'Preparation review completed', 'journey.track.packet': 'Preparation packet generated', 'journey.track.official': 'Official application action', 'journey.done': 'Completed in this browser', 'journey.pending': 'Pending', 'journey.returnTask': 'Return to next task',
};
