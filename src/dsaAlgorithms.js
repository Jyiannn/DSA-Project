export function hashBucket(plate, buckets) {
  if (buckets <= 0) return 0;
  let sum = 0;
  for (const character of String(plate)) sum += character.charCodeAt(0);
  return sum % buckets;
}

export function heapLinks(availableIds) {
  return availableIds.flatMap((child, index) => {
    if (index === 0) return [];
    return [{ parent: availableIds[Math.floor((index - 1) / 2)], child }];
  });
}

function minutes(time) {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(String(time || '').trim());
  if (!match) return 0;
  const hour = Number(match[1]) % 12 + (/pm/i.test(match[3]) ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export function sortedActivity(records) {
  const sorted = records.slice().sort((a, b) => minutes(a.timeIn) - minutes(b.timeIn));
  return { sorted, mid: Math.floor(sorted.length / 2) };
}
