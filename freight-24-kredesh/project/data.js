// Seed data — Kredesh chats (modeled on real Freight 24 WhatsApp ops)
window.KredeshData = (() => {
  const users = [
    { id: 'u1', name: 'Krivashan',     role: 'Ops Lead',           status: 'online', avatar: '#00A884', initials: 'KW' },
    { id: 'u2', name: 'Nerishka F24',  role: 'Ops Coordinator',    status: 'online', avatar: '#A78BFA', initials: 'NF' },
    { id: 'u3', name: 'Preyesh',       role: 'Yard / Warehouse',   status: 'online', avatar: '#F472B6', initials: 'PR' },
    { id: 'u4', name: 'Zaheeda',       role: 'Admin',              status: 'last seen 1h ago', avatar: '#FFB020', initials: 'ZA' },
    { id: 'u5', name: 'Havinesh',      role: 'Warehouse',          status: 'online', avatar: '#06CF9C', initials: 'HV' },
    { id: 'u6', name: 'Russel',        role: 'Transport',          status: 'last seen 2h ago', avatar: '#3B82F6', initials: 'RS' },
    { id: 'u7', name: 'Storm',         role: 'Driver',             status: 'online', avatar: '#F15C6D', initials: 'ST' },
    { id: 'me', name: 'Avery (you)',   role: 'Ops Manager',        status: 'online', avatar: '#00A884', initials: 'AC', isMe: true, isAdmin: true },
  ];

  const chats = [
    {
      id: 'c1', name: 'WHS 24 OPERATIONS', kind: 'group',
      members: ['u5','u1','u2','u3','u6','me'],
      preview: 'Preyesh: 1st Allied container is at the warehouse, 2nd allied on route',
      lastAt: '14:02', unread: 4, pinned: true,
    },
    {
      id: 'c2', with: 'u2', kind: 'dm',
      preview: 'Joeys truck loading out SLES today for delivery to Tristar, Prospecton…',
      lastAt: '08:20', unread: 2,
    },
    {
      id: 'c3', with: 'u1', kind: 'dm',
      preview: 'Plans for tomorrow: 2 x 20fts Allied, 1 x 20ft prime, 1 x 20ft Slackwax…',
      lastAt: '15:45', unread: 0,
    },
    {
      id: 'c4', with: 'u3', kind: 'dm',
      preview: '1st Allied container is at the warehouse. 2nd allied on route.',
      lastAt: '14:02', unread: 0,
    },
    {
      id: 'c5', name: 'Allied Bookings', kind: 'group', members: ['u1','u2','u4','me'],
      preview: 'Zaheeda added Testing 2 Whose Sim Lorenzo F24',
      lastAt: 'Yesterday', unread: 1,
    },
    {
      id: 'c6', with: 'u4', kind: 'dm',
      preview: 'Tronox (Bricks customer) will be in DBN on Thu/Fri and would like to stop by.',
      lastAt: 'Mon', unread: 0,
    },
    {
      id: 'c7', with: 'u7', kind: 'dm',
      preview: 'Loaded out. ETA 08h45.',
      lastAt: 'Mon', unread: 0,
    },
  ];

  // c1 = "WHS 24 OPERATIONS" group — the showcase thread, modeled on the screenshots
  const c1Messages = [
    { kind: 'system', text: 'Today' },

    {
      id: 'm1', from: 'u3', at: '12:01',
      segments: [{ t: 'Drums collapsed' }],
    },

    {
      id: 'm2', from: 'u2', at: '12:02', edited: true,
      segments: [
        { t: 'Hi All\n\nPlease note, the below is planned for delivery to ' },
        { t: 'F24 wrhs', hl: 'location', entity: 'destination' },
        { t: ' tomorrow — ' },
        { t: 'Tristar', hl: true, entity: 'customer' },
        { t: '\n\n' },
        { t: 'FSCU8065100', hl: true, entity: 'container' },
        { t: ' — ' },
        { t: '12m', hl: true, entity: 'size' },
        { t: '\n' },
        { t: 'ISO68750', hl: true, entity: 'iso' },
        { t: '\n\nTransporter — ' },
        { t: 'African Steer', hl: true, entity: 'transporter' },
        { t: '\n\nThank You' },
      ],
    },

    {
      id: 'm3', from: 'u1', at: '13:31',
      segments: [
        { t: 'Hi All\n\nWe will load ' },
        { t: 'prime cargo', hl: true, entity: 'product' },
        { t: ' out today, customer can accept delivery.\n\n' },
        { t: 'Storm', hl: true, entity: 'driver' },
        { t: ' will load out, vehicle details and ETA to follow.\n\nThanks' },
      ],
    },

    {
      id: 'm4', from: 'u1', at: '13:33',
      segments: [
        { t: 'Plans for tomorrow:\n\n' },
        { t: '2 x 20fts Allied', hl: true, entity: 'allied' },
        { t: '\n' },
        { t: '1 x 20ft prime', hl: true, entity: 'prime' },
        { t: '\n\n' },
        { t: '1 x 20ft Slackwax', hl: true, entity: 'slackwax' },
        { t: '\n' },
        { t: '1 x Caustic Soda', hl: true, entity: 'caustic' },
        { t: '\n\nIve booked ' },
        { t: '2 unpack teams', hl: true, entity: 'unpack' },
      ],
    },

    {
      id: 'm5', from: 'u1', at: '13:38',
      segments: [
        { t: 'Tronox', hl: true, entity: 'tronox' },
        { t: ' (Bricks customer) will be in ' },
        { t: 'DBN', hl: 'location', entity: 'dbn' },
        { t: ' on ' },
        { t: 'Thursday and Friday', hl: true, entity: 'tronox-dates' },
        { t: ' and would like to stop by.\n\nHe will confirm time and date' },
      ],
    },

    {
      id: 'extract', kind: 'extract', at: '13:40',
      fields: 12, tasks: 5,
    },

    {
      id: 'm6', from: 'u3', at: '14:02',
      segments: [
        { t: 'Hi All\n\n1st ' },
        { t: 'Allied container', hl: true, entity: 'allied-1' },
        { t: ' is at the warehouse\n\n2nd allied ' },
        { t: 'on route', hl: 'warn', entity: 'allied-2' },
        { t: '\n\nThanks' },
      ],
    },

    {
      id: 'm7', from: 'u2', at: '08:15',
      segments: [
        { t: 'Hi All\n\nPlease see below details for ' },
        { t: 'Joeys truck', hl: true, entity: 'joey-truck' },
        { t: ' loading out ' },
        { t: 'SLES', hl: true, entity: 'sles' },
        { t: ' today for delivery to ' },
        { t: 'Tristar, Prospecton', hl: 'location', entity: 'tristar-prospecton' },
        { t: '\n\nJOEYS LINEHAUL\nCustomer ID — Freight 24\n\nDriver — ' },
        { t: 'Eugene', hl: true, entity: 'driver-eugene' },
        { t: '\nHorse — ' },
        { t: 'CT17549', hl: true, entity: 'horse-ct17549' },
        { t: '\nTrailer 1 — ' },
        { t: 'CT26295', hl: true, entity: 'trailer-1' },
        { t: '\nTrailer 2 — ' },
        { t: 'CT26343', hl: true, entity: 'trailer-2' },
        { t: '\nCell — ' },
        { t: '0726117096', hl: true, entity: 'cell' },
        { t: '\nID — ' },
        { t: '8201205299080', hl: true, entity: 'id' },
      ],
    },

    {
      id: 'm8', from: 'me', at: '08:18',
      replyTo: 'm7',
      segments: [{ t: 'Got it. Logging into the load sheet. ETA?' }],
      status: 'read',
      readBy: [
        { user: 'u1', at: '08:18' },
        { user: 'u2', at: '08:19' },
        { user: 'u3', at: '08:21' },
        { user: 'u5', at: '08:24' },
      ],
    },

    {
      id: 'm9', from: 'u2', at: '08:20',
      replyTo: 'm8',
      segments: [
        { t: 'ETA — ' },
        { t: '08h45', hl: 'time', entity: 'eta' },
      ],
      reminders: [
        { user: 'me', at: '07:45', label: 'Remind me 1h before' },
      ],
    },

    {
      id: 'm10', from: 'u4', at: '13:39',
      segments: [{ t: 'Zaheeda added Testing 2 Whose Sim Lorenzo F24' }],
    },
  ];

  // Tasks — extracted from real-style messages
  const tasks = [
    { id: 'tk1', title: 'Confirm Tristar delivery slot for FSCU8065100',  chat: 'c1', status: 'complete',   assignee: 'me', due: 'Tomorrow 08:00', priority: 'med',  extractedFrom: 'FSCU8065100', completedAt: '12:08' },
    { id: 'tk2', title: 'Log 12m container ISO68750 to F24 wrhs intake',  chat: 'c1', status: 'complete',   assignee: 'me', due: 'Tomorrow',       priority: 'low',  extractedFrom: 'ISO68750',   completedAt: '12:10' },
    { id: 'tk3', title: 'Receive 1st Allied container at warehouse',       chat: 'c1', status: 'complete',   assignee: 'u3', due: 'Today',          priority: 'med',  extractedFrom: '2 x 20fts Allied', completedAt: '13:58' },
    { id: 'tk4', title: 'Track 2nd Allied container on route',             chat: 'c1', status: 'pending',    assignee: 'u3', due: 'Today',          priority: 'high', extractedFrom: '2 x 20fts Allied' },
    { id: 'tk5', title: 'Book 2 unpack teams for tomorrow',                chat: 'c1', status: 'complete',   assignee: 'u1', due: 'Tomorrow 06:00', priority: 'med',  extractedFrom: 'tomorrow plans',  completedAt: '13:34' },
    { id: 'tk6', title: 'Confirm Tronox DBN visit time and date',          chat: 'c1', status: 'pending',    assignee: 'me', due: 'Wed EOD',        priority: 'med',  extractedFrom: 'Tronox' },
    { id: 'tk7', title: 'Load prime cargo out today (driver: Storm)',      chat: 'c1', status: 'pending',    assignee: 'u7', due: 'Today',          priority: 'high', extractedFrom: 'prime cargo' },
    { id: 'tk8', title: 'Send Storm vehicle details + ETA',                chat: 'c1', status: 'pending',    assignee: 'u1', due: 'Today',          priority: 'high', extractedFrom: 'prime cargo' },
    { id: 'tk9', title: 'Confirm Joeys truck arrival at Tristar Prospecton', chat: 'c2', status: 'pending',  assignee: 'me', due: 'Today 09:00',    priority: 'high', extractedFrom: 'Joeys / CT17549' },
    { id: 'tk10', title: 'Log Slackwax + Caustic Soda intake on Friday',   chat: 'c1', status: 'pending',    assignee: 'u5', due: 'Fri',            priority: 'med',  extractedFrom: 'tomorrow plans' },
    { id: 'tk11', title: 'Follow up on drums collapsed incident',          chat: 'c1', status: 'incomplete', assignee: 'u3', due: 'Yesterday',      priority: 'high', extractedFrom: 'Drums collapsed', overdue: true },
    { id: 'tk12', title: 'Add Lorenzo F24 (Testing 2) to group access',    chat: 'c1', status: 'incomplete', assignee: 'u4', due: 'Yesterday',      priority: 'med',  extractedFrom: 'Lorenzo F24', overdue: true },
  ];

  // Admin
  const employees = [
    { id: 'e1', name: 'Krivashan',     email: 'krivashan@freight24.co.za',   role: 'Ops Lead',         status: 'active',    lastActive: '2 min ago',   joined: 'Mar 2022' },
    { id: 'e2', name: 'Nerishka',      email: 'nerishka@freight24.co.za',    role: 'Ops Coordinator',  status: 'active',    lastActive: '8 min ago',   joined: 'Aug 2023' },
    { id: 'e3', name: 'Preyesh',       email: 'preyesh@freight24.co.za',     role: 'Warehouse',        status: 'active',    lastActive: '32 min ago',  joined: 'Jan 2024' },
    { id: 'e4', name: 'Zaheeda',       email: 'zaheeda@freight24.co.za',     role: 'Admin',            status: 'active',    lastActive: '1 hr ago',    joined: 'Feb 2021' },
    { id: 'e5', name: 'Havinesh',      email: 'havinesh@freight24.co.za',    role: 'Warehouse',        status: 'active',    lastActive: 'Just now',    joined: 'Nov 2023' },
    { id: 'e6', name: 'Russel',        email: 'russel@freight24.co.za',      role: 'Transport',        status: 'active',    lastActive: '4 hr ago',    joined: 'Jul 2023' },
    { id: 'e7', name: 'Storm',         email: 'storm@freight24.co.za',       role: 'Driver',           status: 'active',    lastActive: 'Yesterday',   joined: 'Sep 2024' },
    { id: 'e8', name: 'Lorenzo F24',   email: 'lorenzo@freight24.co.za',     role: 'Ops Coordinator',  status: 'invited',   lastActive: '—',           joined: 'Invited 2d ago' },
    { id: 'e9', name: 'Testing 2',     email: 'testing2@freight24.co.za',    role: 'Driver',           status: 'invited',   lastActive: '—',           joined: 'Invited 5h ago' },
    { id: 'e10', name: 'Old Account',  email: 'archive@freight24.co.za',     role: 'Driver',           status: 'suspended', lastActive: '14 d ago',    joined: 'May 2022' },
  ];

  const roles = ['Ops Lead', 'Ops Coordinator', 'Warehouse', 'Transport', 'Driver', 'Admin'];

  // ETA dashboard — scheduled arrivals (auto-extracted from chats)
  const etas = [
    { id: 'e1', kind: 'inbound',  what: 'Joeys Linehaul · SLES',           detail: 'Driver Eugene · Horse CT17549 + 2 trailers', customer: 'Tristar', dest: 'Prospecton',  vehicle: 'CT17549', at: '08:45', when: 'today', status: 'arrived',   chat: 'c1', mins: -45 },
    { id: 'e2', kind: 'inbound',  what: '1× 20ft Allied container',         detail: '1st of 2 Allied · received at F24 wrhs',     customer: 'Allied',  dest: 'F24 wrhs',   vehicle: '—',       at: '13:40', when: 'today', status: 'arrived',   chat: 'c1', mins: -38 },
    { id: 'e3', kind: 'inbound',  what: '1× 20ft Allied container',         detail: '2nd of 2 Allied · on route',                 customer: 'Allied',  dest: 'F24 wrhs',   vehicle: 'CT19844', at: '14:30', when: 'today', status: 'enroute',   chat: 'c1', mins: 12 },
    { id: 'e4', kind: 'outbound', what: 'Prime cargo loadout',              detail: 'Driver: Storm · vehicle TBC',                customer: 'Prime',   dest: 'Customer',   vehicle: 'TBC',     at: '15:30', when: 'today', status: 'scheduled', chat: 'c1', mins: 72 },
    { id: 'e5', kind: 'inbound',  what: 'FSCU8065100 · 12m',                detail: 'Transporter African Steer · ISO68750',        customer: 'Tristar', dest: 'F24 wrhs',   vehicle: 'African Steer', at: '09:30', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e6', kind: 'inbound',  what: '2× 20ft Allied',                   detail: '2 unpack teams booked',                       customer: 'Allied',  dest: 'F24 wrhs',   vehicle: '—',       at: '08:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e7', kind: 'inbound',  what: '1× 20ft Slackwax',                 detail: 'Tomorrow plan',                               customer: 'Slackwax',dest: 'F24 wrhs',   vehicle: '—',       at: '11:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e8', kind: 'inbound',  what: '1× Caustic Soda',                  detail: 'Tomorrow plan',                               customer: 'Caustic', dest: 'F24 wrhs',   vehicle: '—',       at: '13:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e9', kind: 'visit',    what: 'Tronox customer visit',            detail: 'TBC by customer',                              customer: 'Tronox',  dest: 'DBN office', vehicle: '—',       at: 'TBC',   when: 'thursday', status: 'scheduled', chat: 'c1' },
    { id: 'e10', kind: 'visit',   what: 'Tronox customer visit',            detail: 'TBC by customer',                              customer: 'Tronox',  dest: 'DBN office', vehicle: '—',       at: 'TBC',   when: 'friday',  status: 'scheduled', chat: 'c1' },
    { id: 'e11', kind: 'outbound',what: 'NIS slings load #1',               detail: '9 Jan Friday · X2',                            customer: 'NIS',     dest: '—',          vehicle: '—',       at: '06:00', when: 'fri 9',   status: 'scheduled', chat: 'c1' },
  ];

  return {
    users, chats, c1Messages, tasks, employees, roles, etas,
    byId: (arr, id) => arr.find(x => x.id === id),
  };
})();
