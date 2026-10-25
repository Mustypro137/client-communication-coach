/* All sample content. Edit this file to add scenarios or phrases. */

/* =========================================================
   2. SAMPLE DATA — scenarios, phrases, progress
   ========================================================= */
export const SCENARIOS = [
  {
    id: 'bakery',
    title: 'New website for a bakery',
    client: 'Adjoa Mensah',
    initials: 'AM',
    role: 'Owner, Sweet Crumbs Bakery',
    avatarBg: '#F4E3CC',
    level: 1,
    objective: 'Understand what she needs and agree on a next step before you give a price.',
    opening: [
      'Good morning! I got your number from my cousin Kwame. He said you build websites.',
      'I own a small bakery. We sell cakes, bread and pastries. I want a website so people can see our cakes and order for birthdays. How much will it cost?'
    ],
    // Questions a good freelancer should ask. Keywords decide if the user "asked" it.
    checks: [
      { label: 'Which pages or features she needs', words: ['page', 'feature', 'menu', 'gallery', 'section', 'photos of'] },
      { label: 'Whether customers should order or pay online', words: ['order', 'pay', 'payment', 'delivery', 'booking'] },
      { label: 'Her budget', words: ['budget', 'spend', 'afford', 'price range'] },
      { label: 'When she needs the website', words: ['when', 'deadline', 'launch', 'timeline', 'date', 'ready by'] },
      { label: 'If she has a logo, photos or a domain', words: ['logo', 'domain', 'brand', 'pictures', 'photo'] }
    ],
    followUps: [
      'Thank you for asking! I want a page for our cakes with photos and prices, and a way for customers to order birthday cakes 3 days before.',
      'My budget is not very big, maybe around $400. I would like the website before the end of next month, because we have a big promotion.',
      'That sounds good. What do you need from me to start?'
    ],
    modelReply: "Good morning, Mrs. Mensah, and thank you for reaching out! I'd be happy to help Sweet Crumbs Bakery get online.\n\nBefore I give you a price, I'd like to understand what you need:\n1. Which pages would you like (cakes menu, gallery, about, contact)?\n2. Should customers pay online, or just send an order request?\n3. Do you already have a logo, photos and a domain name?\n4. When would you like the website to be ready, and do you have a budget in mind?\n\nOnce I have your answers, I'll send you a clear quote and timeline. Would a short call this week work for you?",
    lastScore: 68, lastDate: 'Yesterday'
  },
  {
    id: 'discount',
    title: 'Client asks for a discount',
    client: 'Daniel Osei',
    initials: 'DO',
    role: 'Marketing lead, Northpoint Clinic',
    avatarBg: '#DCE7F5',
    level: 2,
    objective: 'Protect your price. Offer a smaller scope or payment plan instead of a big discount.',
    opening: [
      'Hi, we reviewed your quote of $1,200 for the clinic website.',
      "It looks good, but it's above our budget. Can you do it for $800?"
    ],
    checks: [
      { label: 'Which features matter most to them', words: ['priority', 'important', 'must', 'essential', 'feature', 'need most'] },
      { label: 'What their real budget limit is', words: ['budget', 'maximum', 'flexible', 'limit'] },
      { label: 'If a payment plan would help', words: ['payment', 'deposit', 'installment', 'instalment', 'milestone', 'split'] },
      { label: 'Their deadline', words: ['deadline', 'when', 'timeline', 'launch'] }
    ],
    followUps: [
      'The most important parts are the services page and online appointment requests. The blog can wait.',
      'Our maximum is around $900 this quarter. Could we pay in two parts?',
      "Okay, please send the updated proposal and we'll review it on Monday."
    ],
    modelReply: "Hi Daniel, thank you for reviewing the quote, and for being open about your budget.\n\nI can't lower the price for the same work, but I can adjust the scope so it fits $800–900. For example, we could launch with the services page and appointment requests first, and add the blog later.\n\nI can also split the payment: 50% to start and 50% at launch.\n\nWhich features are most important for you at launch? I'll send an updated proposal today.",
    lastScore: 61, lastDate: 'Thu'
  },
  {
    id: 'payment',
    title: 'Follow up on a late payment',
    client: 'Sophie Laurent',
    initials: 'SL',
    role: 'Founder, Atelier Lumière',
    avatarBg: '#EADFF0',
    level: 2,
    objective: 'Stay polite and friendly, but get a clear payment date.',
    opening: [
      'Hi! Sorry, I know the invoice is late.',
      'Things have been really busy this month. I will look at it soon.'
    ],
    checks: [
      { label: 'A specific payment date', words: ['date', 'by friday', 'by monday', 'when', 'this week', 'by '] },
      { label: 'The invoice number or amount', words: ['invoice', 'amount', '#', 'total'] },
      { label: 'How she plans to pay', words: ['transfer', 'method', 'mobile money', 'paypal', 'bank'] }
    ],
    followUps: [
      'Yes of course. It is invoice #0142 for $650, right?',
      'I can send it by bank transfer on Wednesday.',
      'Thank you for being patient with me!'
    ],
    modelReply: "Hi Sophie, thank you for letting me know, I understand busy months!\n\nJust to confirm, this is invoice #0142 for $650, which was due on 15 October. Could you let me know which day you plan to send the payment? A bank transfer or mobile money both work for me.\n\nThanks again, and let me know if you need a copy of the invoice.",
    lastScore: 82, lastDate: 'Tue'
  },
  {
    id: 'scope',
    title: 'Extra work outside the agreement',
    client: 'Ibrahim Diallo',
    initials: 'ID',
    role: 'Operations manager, Swift Logistics',
    avatarBg: '#DDEDE4',
    level: 3,
    objective: 'Say no to free extra work without damaging the relationship. Explain the cost and time.',
    opening: [
      'The dashboard looks great, well done!',
      'Can you also add a mobile app version? It should be quick, right? We need it by Friday.'
    ],
    checks: [
      { label: 'What the mobile version must do', words: ['feature', 'what should', 'which', 'requirement', 'need it to'] },
      { label: 'That extra work has an extra cost', words: ['cost', 'price', 'quote', 'budget', 'fee', 'extra'] },
      { label: 'Whether Friday is a firm deadline', words: ['friday', 'deadline', 'realistic', 'timeline', 'flexible'] },
      { label: 'What matters most for them first', words: ['priority', 'first', 'most important', 'phase'] }
    ],
    followUps: [
      'Mostly our drivers need to see their deliveries and mark them as done.',
      'Friday is for a demo with our director. Maybe it can be a simple version first?',
      'Okay, send me the quote for that and we can decide today.'
    ],
    modelReply: "Thank you, Ibrahim, I'm glad you like the dashboard!\n\nA mobile app is a new project, so it isn't included in our current agreement. Building it properly takes more than a few days.\n\nTo help you, I can suggest two options:\n1. A mobile-friendly version of the dashboard for Friday's demo, as a small extra.\n2. A full mobile app later, with its own quote and timeline.\n\nWhat do your team need to do on mobile first? I'll send a short quote today.",
    lastScore: null, lastDate: 'New'
  }
];

export const PHRASES = [
  { cat: 'greetings', text: 'Thank you for reaching out.', mean: 'A polite way to start a reply to someone who contacted you first.', use: 'Use at the start of your first reply to a new client.' },
  { cat: 'greetings', text: "It's great to hear from you again.", mean: 'Shows you remember and value a returning client.', use: 'For clients you have worked with before.' },
  { cat: 'greetings', text: 'I hope your week is going well.', mean: 'A warm, short opening before you get to business.', use: 'Good for LinkedIn and email. Keep it shorter on WhatsApp.' },
  { cat: 'greetings', text: "I'd be happy to help with your project.", mean: 'Says yes in a professional, positive way.', use: 'After the greeting, before asking questions.' },
  { cat: 'pricing', text: 'My price depends on the size of the project.', mean: "Explains why you can't give a price before you know the details.", use: "When a client asks 'How much?' in the first message." },
  { cat: 'pricing', text: 'I usually ask for a 50% deposit before I start.', mean: 'Half the money is paid at the beginning to confirm the project.', use: 'When you send a quote or agree to start.' },
  { cat: 'pricing', text: "I can't lower the price for the same work, but I can adjust the scope.", mean: 'You keep your price fair, and offer to do less work for less money.', use: 'When a client asks for a discount.' },
  { cat: 'pricing', text: 'This quote is valid for 14 days.', mean: 'The price may change after two weeks.', use: 'At the end of a quote or proposal.' },
  { cat: 'pricing', text: 'Would a payment plan make this easier for you?', mean: 'Offers to split the payment into smaller parts.', use: 'When a client likes the work but worries about the cost.' },
  { cat: 'deadlines', text: 'I can have the first version ready by Friday.', mean: 'Gives a clear, specific date the client can plan around.', use: 'Always give a real day, not "soon".' },
  { cat: 'deadlines', text: 'To meet that date, I would need the content by Monday.', mean: 'Your deadline depends on the client sending things on time.', use: 'When the client wants a fast delivery.' },
  { cat: 'deadlines', text: "I want to be honest: that timeline is too short to do it well.", mean: 'Politely says the deadline is not realistic.', use: 'Better than saying yes and being late.' },
  { cat: 'deadlines', text: "I'll keep you updated on my progress every Wednesday.", mean: 'Promises regular updates so the client feels calm.', use: 'At the start of a project.' },
  { cat: 'revisions', text: 'The quote includes two rounds of revisions.', mean: 'The client can ask for changes two times without extra cost.', use: 'In your proposal, so expectations are clear.' },
  { cat: 'revisions', text: 'Thank you for the feedback. I will update it today.', mean: 'Accepts feedback calmly and gives a time.', use: 'When a client sends change requests.' },
  { cat: 'revisions', text: 'This change is outside our agreement, so I will send a separate quote.', mean: 'New work costs extra, explained politely.', use: 'When the client asks for something new.' },
  { cat: 'revisions', text: 'Could you show me an example of what you have in mind?', mean: 'Asks for a reference so you understand the change.', use: 'When feedback is vague, like "make it pop".' },
  { cat: 'followups', text: "I'm following up on my message from Tuesday.", mean: 'A polite reminder that you sent something before.', use: 'Two or three days after no reply.' },
  { cat: 'followups', text: 'Have you had a chance to look at the proposal?', mean: 'Asks if they read it, without pressure.', use: 'After you send a quote or proposal.' },
  { cat: 'followups', text: 'Just a friendly reminder that invoice #0142 was due on 15 October.', mean: 'Reminds the client to pay, in a kind tone.', use: 'When a payment is late. Always include the invoice number.' },
  { cat: 'followups', text: "If now isn't the right time, no problem. I'm here when you're ready.", mean: 'Closes the follow-up kindly and keeps the door open.', use: 'After two follow-ups with no answer.' },
  { cat: 'questions', text: 'Could you tell me a bit more about your business?', mean: 'Opens the conversation so the client explains their needs.', use: 'Early in a first conversation.' },
  { cat: 'questions', text: 'Who will use the website most: new customers or existing ones?', mean: 'Helps you understand the audience.', use: 'Before you design anything.' },
  { cat: 'questions', text: 'Do you have a budget range in mind?', mean: 'A polite way to ask how much they can spend.', use: 'Before you send a quote.' }
];
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'greetings', label: 'Greetings' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'revisions', label: 'Revisions' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'questions', label: 'Questions' },
  { id: 'saved', label: 'Saved' }
];

export const WEEK_MINUTES = [12, 18, 0, 22, 15, 9, 0]; // Sunday (today) starts at 0 and grows as you practise
export const SKILLS = [
  { name: 'Professional tone', score: 81 },
  { name: 'Asking good questions', score: 72 },
  { name: 'Clear English', score: 66 },
  { name: 'Talking about price', score: 48 }
];
export const HISTORY = [
  { date: '24 Oct', id: 'bakery', replies: 3, score: 68 },
  { date: '22 Oct', id: 'discount', replies: 2, score: 61 },
  { date: '20 Oct', id: 'payment', replies: 3, score: 82 },
  { date: '18 Oct', id: 'bakery', replies: 4, score: 63 },
  { date: '17 Oct', id: 'payment', replies: 2, score: 77 }
];
