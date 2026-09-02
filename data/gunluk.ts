export type JournalEntry = {
  id: string;
  title: string;
  date: string;
  photoUrl: string;
  whatHappened: string;
  cause: string;
  fix: string;
  settingChanged: string;
};

/** Atölye devlog kayıtları henüz yok — /gunluk beklemeye alındı. */
export const journal: JournalEntry[] = [];
