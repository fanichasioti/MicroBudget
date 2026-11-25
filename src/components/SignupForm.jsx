import { useState } from "react";
import { validateProfile } from "../utils/validation.js";

export default function SignupForm({ profile, onSave, onCancel, onError, firstRun = false }) {
  const [values, setValues] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
  });
  const [errors, setErrors] = useState({});

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Έλεγξε τα στοιχεία που συμπλήρωσες.");
      return;
    }
    onSave({ name: values.name.trim(), email: values.email.trim() });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !firstRun) onCancel();
        }}
      >
        <span className="brand-pill">MicroBudget</span>
        <h2 id="profile-title">{firstRun ? "Καλώς ήρθες!" : "Το προφίλ σου"}</h2>
        <p>{firstRun ? "Ρύθμισε το προφίλ σου για να ξεκινήσεις να παρακολουθείς τα έξοδά σου." : "Τα στοιχεία σου αποθηκεύονται μόνο σε αυτή τη συσκευή."}</p>
        <form onSubmit={submit} noValidate>
          <label className="field">
            Όνομα
            <input
              autoFocus
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={update}
              placeholder="Πώς σε λένε;"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "profile-name-error" : undefined}
            />
            {errors.name && <span className="field-error" id="profile-name-error">{errors.name}</span>}
          </label>
          <label className="field">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update}
              placeholder="maria@email.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "profile-email-error" : undefined}
            />
            {errors.email && <span className="field-error" id="profile-email-error">{errors.email}</span>}
          </label>
          <div className="form-actions">
            {!firstRun && <button className="button button-secondary" type="button" onClick={onCancel}>Ακύρωση</button>}
            <button className="button button-primary" type="submit">{firstRun ? "Έναρξη" : "Αποθήκευση"}</button>
          </div>
        </form>
        <small className="privacy-note">Δεν απαιτείται λογαριασμός ή κωδικός. Τα δεδομένα παραμένουν στη συσκευή σου.</small>
      </section>
    </div>
  );
}
