const CATEGORY_META = {
  all: {
    label: 'All',
    icon: '✨',
    description: 'Browse the full catalog of weird gadgets, funny gifts, and impulse-buy favorites.',
  },
  general: {
    label: 'General Finds',
    icon: '🪩',
    description: 'Browse our catch-all mix of quirky products, unusual gifts, and hard-to-classify discoveries.',
  },
  tech: {
    label: 'Tech & Gadgets',
    icon: '⚡',
    description: 'Browse standout gadgets, smart gear, desk toys, and tech gifts worth a second look.',
  },
  home: {
    label: 'Home & Kitchen',
    icon: '🏠',
    description: 'Browse clever home upgrades, kitchen tools, decor finds, and conversation-starting appliances.',
  },
  apparel: {
    label: 'Apparel & Fashion',
    icon: '👕',
    description: 'Browse offbeat fashion, wearable gifts, and statement pieces that do more than blend in.',
  },
  gaming: {
    label: 'Gaming & Fun',
    icon: '🎮',
    description: 'Browse gaming gear, collectible fun, and playful products built for nerdy downtime.',
  },
  outdoor: {
    label: 'Lifestyle & Outdoor',
    icon: '🏔️',
    description: 'Browse outdoor gear, travel-friendly finds, and lifestyle upgrades for adventures and weekends.',
  },
  food: {
    label: 'Food & Drink',
    icon: '🍕',
    description: 'Browse foodie gifts, drinkware, kitchen novelties, and edible splurges with personality.',
  },
  vehicles: {
    label: 'Vehicles',
    icon: '🚗',
    description: 'Browse dream cars, extreme rides, and ridiculous vehicle upgrades you probably should not buy.',
  },
  pet: {
    label: 'Gifts for Pets',
    icon: '🐾',
    description: 'Browse pet-friendly gifts, accessories, and absurd upgrades for spoiled cats and dogs.',
  },
  office: {
    label: 'Office Gear',
    icon: '💼',
    description: 'Browse office upgrades, desk gadgets, and workday gear that makes the grind a little weirder.',
  },
  kids: {
    label: 'Gifts for Kids',
    icon: '🧸',
    description: 'Browse toys, games, and family-friendly gifts that feel fun instead of forgettable.',
  },
  novelty: {
    label: 'Novelty & Gifts',
    icon: '🎁',
    description: 'Browse funny gifts, novelty products, and bizarre finds that make excellent impulse buys.',
  },
  adult: {
    label: 'Adult & Nightlife',
    icon: '🔞',
    description: 'Browse cheeky nightlife gear, adult products, and late-night conversation starters.',
  },
  fitness: {
    label: 'Fitness & Health',
    icon: '💪',
    description: 'Browse workout gear, recovery tools, and health-focused upgrades with real gift appeal.',
  },
  kitchen: {
    label: 'Kitchen',
    icon: '🍳',
    description: 'Browse kitchen gadgets, cooking tools, and clever finds made for hungry tinkerers.',
  },
};

function titleCase(value) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatCategoryName(category = '') {
  if (!category) {
    return CATEGORY_META.all.label;
  }

  return titleCase(category);
}

export function getCategoryMeta(category = 'all') {
  if (CATEGORY_META[category]) {
    return CATEGORY_META[category];
  }

  return {
    label: formatCategoryName(category),
    icon: '🏷️',
    description: `Browse curated ${formatCategoryName(category).toLowerCase()} finds, unusual gifts, and memorable products.`,
  };
}

export function getCategoryLabel(category = 'all') {
  return getCategoryMeta(category).label;
}

export function getCategoryIcon(category = 'all') {
  return getCategoryMeta(category).icon;
}

export function getCategoryDescription(category = 'all') {
  return getCategoryMeta(category).description;
}

export function getKnownCategoryMeta() {
  return CATEGORY_META;
}
