export type Accent = "brand" | "sky";

export interface AccentClasses {
  blob: string;
  addButton: string;
  submit: string;
  ring: string;
}

// Classes écrites en toutes lettres pour que Tailwind les détecte.
export const ACCENTS: Record<Accent, AccentClasses> = {
  brand: {
    blob: "bg-brand-700/10",
    addButton: "gradient-brand glow-brand-sm",
    submit: "gradient-brand",
    ring: "focus:ring-brand-700/50",
  },
  sky: {
    blob: "bg-sky-500/10",
    addButton: "bg-sky-500 shadow-lg shadow-sky-500/30",
    submit: "bg-sky-500",
    ring: "focus:ring-sky-500/50",
  },
};
