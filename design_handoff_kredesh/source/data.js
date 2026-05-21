// Seed data — Kredesh chats (modeled on real Freight 24 WhatsApp ops)
window.KredeshData = (() => {
  const users = [
    { id: 'u1', name: 'Krivashan',     role: 'Ops Lead',           status: 'online',             avatar: '#00A884', initials: 'KW' },
    { id: 'u2', name: 'Nerishka F24',  role: 'Ops Coordinator',    status: 'online',             avatar: '#A78BFA', initials: 'NF' },
    { id: 'u3', name: 'Preyesh',       role: 'Yard / Warehouse',   status: 'online',             avatar: '#F472B6', initials: 'PR' },
    { id: 'u4', name: 'Zaheeda',       role: 'Admin',              status: 'last seen 1h ago',   avatar: '#FFB020', initials: 'ZA' },
    { id: 'u5', name: 'Havinesh',      role: 'Warehouse',          status: 'online',             avatar: '#06CF9C', initials: 'HV' },
    { id: 'u6', name: 'Russel',        role: 'Transport',          status: 'last seen 2h ago',   avatar: '#3B82F6', initials: 'RS' },
    { id: 'u7', name: 'Storm',         role: 'Driver',             status: 'online',             avatar: '#F15C6D', initials: 'ST' },
    { id: 'me', name: 'Avery (you)',   role: 'Ops Manager',        status: 'online',             avatar: '#00A884', initials: 'AC', isMe: true, isAdmin: true },
  ];

  const chats = [
    {
      id: 'c1', name: 'WHS 24 OPERATIONS', kind: 'group',
      members: ['u5','u1','u2','u3','u6','me'],
      preview: '', lastAt: '', unread: 0, pinned: true,
    },
    { id: 'c2', with: 'u2', kind: 'dm', preview: '', lastAt: '', unread: 0 },
    { id: 'c3', with: 'u1', kind: 'dm', preview: '', lastAt: '', unread: 0 },
    { id: 'c4', with: 'u3', kind: 'dm', preview: '', lastAt: '', unread: 0 },
    {
      id: 'c5', name: 'Allied Bookings', kind: 'group', members: ['u1','u2','u4','me'],
      preview: '', lastAt: '', unread: 0,
    },
    { id: 'c6', with: 'u4', kind: 'dm', preview: '', lastAt: '', unread: 0 },
    { id: 'c7', with: 'u7', kind: 'dm', preview: '', lastAt: '', unread: 0 },
  ];

  const c1Messages = [
    { kind: 'system', text: 'Today' },
  ];

  const tasks = [];

  const employees = [
    { id: 'e1',  name: 'Krivashan',    email: 'krivashan@freight24.co.za',  role: 'Ops Lead',        status: 'active',    lastActive: '2 min ago',  joined: 'Mar 2022' },
    { id: 'e2',  name: 'Nerishka',     email: 'nerishka@freight24.co.za',   role: 'Ops Coordinator', status: 'active',    lastActive: '8 min ago',  joined: 'Aug 2023' },
    { id: 'e3',  name: 'Preyesh',      email: 'preyesh@freight24.co.za',    role: 'Warehouse',       status: 'active',    lastActive: '32 min ago', joined: 'Jan 2024' },
    { id: 'e4',  name: 'Zaheeda',      email: 'zaheeda@freight24.co.za',    role: 'Admin',           status: 'active',    lastActive: '1 hr ago',   joined: 'Feb 2021' },
    { id: 'e5',  name: 'Havinesh',     email: 'havinesh@freight24.co.za',   role: 'Warehouse',       status: 'active',    lastActive: 'Just now',   joined: 'Nov 2023' },
    { id: 'e6',  name: 'Russel',       email: 'russel@freight24.co.za',     role: 'Transport',       status: 'active',    lastActive: '4 hr ago',   joined: 'Jul 2023' },
    { id: 'e7',  name: 'Storm',        email: 'storm@freight24.co.za',      role: 'Driver',          status: 'active',    lastActive: 'Yesterday',  joined: 'Sep 2024' },
    { id: 'e8',  name: 'Lorenzo F24',  email: 'lorenzo@freight24.co.za',    role: 'Ops Coordinator', status: 'invited',   lastActive: '—',          joined: 'Invited 2d ago' },
    { id: 'e9',  name: 'Testing 2',    email: 'testing2@freight24.co.za',   role: 'Driver',          status: 'invited',   lastActive: '—',          joined: 'Invited 5h ago' },
    { id: 'e10', name: 'Old Account',  email: 'archive@freight24.co.za',    role: 'Driver',          status: 'suspended', lastActive: '14 d ago',   joined: 'May 2022' },
  ];

  const roles = ['Ops Lead', 'Ops Coordinator', 'Warehouse', 'Transport', 'Driver', 'Admin'];

  const etas = [
    { id: 'e1',  kind: 'inbound',  what: 'Joeys Linehaul · SLES',       detail: 'Driver Eugene · Horse CT17549 + 2 trailers', customer: 'Tristar',  dest: 'Prospecton',  vehicle: 'CT17549',      at: '08:45', when: 'today',    status: 'arrived',   chat: 'c1', mins: -45 },
    { id: 'e2',  kind: 'inbound',  what: '1× 20ft Allied container',     detail: '1st of 2 Allied · received at F24 wrhs',     customer: 'Allied',   dest: 'F24 wrhs',    vehicle: '—',            at: '13:40', when: 'today',    status: 'arrived',   chat: 'c1', mins: -38 },
    { id: 'e3',  kind: 'inbound',  what: '1× 20ft Allied container',     detail: '2nd of 2 Allied · on route',                 customer: 'Allied',   dest: 'F24 wrhs',    vehicle: 'CT19844',      at: '14:30', when: 'today',    status: 'enroute',   chat: 'c1', mins: 12  },
    { id: 'e4',  kind: 'outbound', what: 'Prime cargo loadout',          detail: 'Driver: Storm · vehicle TBC',                customer: 'Prime',    dest: 'Customer',    vehicle: 'TBC',          at: '15:30', when: 'today',    status: 'scheduled', chat: 'c1', mins: 72  },
    { id: 'e5',  kind: 'inbound',  what: 'FSCU8065100 · 12m',            detail: 'Transporter African Steer · ISO68750',        customer: 'Tristar',  dest: 'F24 wrhs',    vehicle: 'African Steer',at: '09:30', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e6',  kind: 'inbound',  what: '2× 20ft Allied',               detail: '2 unpack teams booked',                       customer: 'Allied',   dest: 'F24 wrhs',    vehicle: '—',            at: '08:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e7',  kind: 'inbound',  what: '1× 20ft Slackwax',             detail: 'Tomorrow plan',                               customer: 'Slackwax', dest: 'F24 wrhs',    vehicle: '—',            at: '11:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e8',  kind: 'inbound',  what: '1× Caustic Soda',              detail: 'Tomorrow plan',                               customer: 'Caustic',  dest: 'F24 wrhs',    vehicle: '—',            at: '13:00', when: 'tomorrow', status: 'scheduled', chat: 'c1' },
    { id: 'e9',  kind: 'visit',    what: 'Tronox customer visit',        detail: 'TBC by customer',                              customer: 'Tronox',   dest: 'DBN office',  vehicle: '—',            at: 'TBC',   when: 'thursday', status: 'scheduled', chat: 'c1' },
    { id: 'e10', kind: 'visit',    what: 'Tronox customer visit',        detail: 'TBC by customer',                              customer: 'Tronox',   dest: 'DBN office',  vehicle: '—',            at: 'TBC',   when: 'friday',   status: 'scheduled', chat: 'c1' },
    { id: 'e11', kind: 'outbound', what: 'NIS slings load #1',           detail: '9 Jan Friday · X2',                            customer: 'NIS',      dest: '—',           vehicle: '—',            at: '06:00', when: 'fri 9',    status: 'scheduled', chat: 'c1' },
  ];

  return {
    users, chats, c1Messages, tasks, employees, roles, etas,
    byId: (arr, id) => arr.find(x => x.id === id),
  };
})();
