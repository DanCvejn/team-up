export function pluralize(
  count: number,
  singular: string,
  plural2to4: string,
  plural5plus: string
): string {
  if (count === 1) {
    return `${count} ${singular}`;
  }

  if (count >= 2 && count <= 4) {
    return `${count} ${plural2to4}`;
  }

  return `${count} ${plural5plus}`;
}

/**
 * Vrátí jen sklonené slovo bez čísla
 */
export function pluralizeWord(
  count: number,
  singular: string,
  plural2to4: string,
  plural5plus: string
): string {
  if (count === 1) {
    return singular;
  }

  if (count >= 2 && count <= 4) {
    return plural2to4;
  }

  return plural5plus;
}

/**
 * Předpřipravené často používané tvary
 */
export const Plurals = {
  member: (count: number) => pluralize(count, 'člen', 'členové', 'členů'),
  memberWord: (count: number) => pluralizeWord(count, 'člen', 'členové', 'členů'),

  event: (count: number) => pluralize(count, 'akce', 'akce', 'akcí'),
  eventWord: (count: number) => pluralizeWord(count, 'akce', 'akce', 'akcí'),

  team: (count: number) => pluralize(count, 'tým', 'týmy', 'týmů'),
  teamWord: (count: number) => pluralizeWord(count, 'tým', 'týmy', 'týmů'),

  person: (count: number) => pluralize(count, 'člověk', 'lidi', 'lidí'),
  personWord: (count: number) => pluralizeWord(count, 'člověk', 'lidi', 'lidí'),

  response: (count: number) => pluralize(count, 'odpověď', 'odpovědi', 'odpovědí'),
  responseWord: (count: number) => pluralizeWord(count, 'odpověď', 'odpovědi', 'odpovědí'),

  guest: (count: number) => pluralize(count, 'host', 'hosté', 'hostů'),
  guestWord: (count: number) => pluralizeWord(count, 'host', 'hosté', 'hostů'),

  day: (count: number) => pluralize(count, 'den', 'dny', 'dní'),
  dayWord: (count: number) => pluralizeWord(count, 'den', 'dny', 'dní'),

  hour: (count: number) => pluralize(count, 'hodina', 'hodiny', 'hodin'),
  hourWord: (count: number) => pluralizeWord(count, 'hodina', 'hodiny', 'hodin'),

  minute: (count: number) => pluralize(count, 'minuta', 'minuty', 'minut'),
  minuteWord: (count: number) => pluralizeWord(count, 'minuta', 'minuty', 'minut'),
};