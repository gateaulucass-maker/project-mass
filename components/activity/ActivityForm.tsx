import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ACCENTS, type Accent } from "./accent";

interface BaseField {
  name: string;
  /** Libellé accessible (masqué visuellement, le placeholder/la liste sert de repère). */
  label: string;
  defaultValue?: string;
  /** Conserver la valeur après un enregistrement réussi. */
  keepOnReset?: boolean;
}

export interface NumberField extends BaseField {
  kind: "number";
  step: string;
  placeholder: string;
  autoFocus?: boolean;
}

export interface SelectField extends BaseField {
  kind: "select";
  options: { value: string; label: string }[];
}

export type FormFieldConfig = NumberField | SelectField;
export type FormValues = Record<string, string>;

export interface ActivityFormProps {
  accent: Accent;
  fields: FormFieldConfig[];
  /** "grid" : 2 colonnes dès `sm` ; "inline" : champ + bouton sur une ligne. */
  layout?: "grid" | "inline";
  /** Retourne true si l'enregistrement a réussi (réinitialise et referme). */
  onSubmit: (values: FormValues) => boolean;
  onDone: () => void;
  footer?: (values: FormValues) => React.ReactNode;
}

function initialValues(fields: FormFieldConfig[]): FormValues {
  return Object.fromEntries(
    fields.map((f) => [f.name, f.defaultValue ?? (f.kind === "select" ? f.options[0]?.value ?? "" : "")]),
  );
}

export function ActivityForm({ accent, fields, layout = "grid", onSubmit, onDone, footer }: ActivityFormProps) {
  const baseId = useId();
  const a = ACCENTS[accent];
  const [values, setValues] = useState<FormValues>(() => initialValues(fields));
  const inline = layout === "inline";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmit(values)) return;
    const defaults = initialValues(fields);
    setValues((prev) => Object.fromEntries(fields.map((f) => [f.name, f.keepOnReset ? prev[f.name] : defaults[f.name]])));
    onDone();
  }

  const inputClass = `${inline ? "flex-1 " : ""}px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 ${a.ring} transition-all`;

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={handleSubmit}
      className={`mt-4 pt-4 border-t border-border ${inline ? "flex gap-3" : "space-y-3"}`}
    >
      <div className={inline ? "contents" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        {fields.map((f) => {
          const id = `${baseId}-${f.name}`;
          const set = (v: string) => setValues((prev) => ({ ...prev, [f.name]: v }));
          return (
            <div key={f.name} className={inline ? "flex-1 flex" : "flex"}>
              <label htmlFor={id} className="sr-only">{f.label}</label>
              {f.kind === "number" ? (
                <input
                  id={id}
                  type="number"
                  step={f.step}
                  value={values[f.name]}
                  onChange={(e) => set(e.target.value)}
                  placeholder={f.placeholder}
                  autoFocus={f.autoFocus}
                  className={`${inputClass} w-full`}
                />
              ) : (
                <select id={id} value={values[f.name]} onChange={(e) => set(e.target.value)} className={`${inputClass} w-full`}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
      {footer?.(values)}
      <button
        type="submit"
        className={`${inline ? "" : "w-full "}px-5 py-2.5 ${a.submit} text-white font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all`}
      >
        Enregistrer
      </button>
    </motion.form>
  );
}
