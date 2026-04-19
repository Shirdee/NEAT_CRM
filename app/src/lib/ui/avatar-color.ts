const AVATAR_TONES = [
  {bg: "bg-teal/12", text: "text-teal"},
  {bg: "bg-coral/10", text: "text-coral"},
  {bg: "bg-amber/15", text: "text-amber-text"},
  {bg: "bg-lime/15", text: "text-lime/80"},
  {bg: "bg-ink/8", text: "text-ink/50"}
] as const;

function hashName(name: string): number {
  let hash = 0;
  const normalized = name.trim().toLocaleLowerCase();

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function avatarTone(name: string) {
  const normalized = name.trim();
  if (!normalized) {
    return AVATAR_TONES[0];
  }

  const idx = hashName(normalized) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}
