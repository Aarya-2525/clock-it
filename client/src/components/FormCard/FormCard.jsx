import { motion } from 'motion/react';
import { Button } from '../Button/Button';
import './FormCard.css';

// Card shell shared by every form page: title, intro, form-level error,
// fields, a full-width submit button and an optional footer line.
export function FormCard({ title, intro, onSubmit, formError, submitting, submitLabel, busyLabel, footer, children }) {
  return (
    <motion.section
      className="form-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1>{title}</h1>
      {intro && <p className="form-card-intro">{intro}</p>}
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <p className="form-card-error" role="alert">
            {formError}
          </p>
        )}
        {children}
        <Button type="submit" variant="solid" size="lg" className="form-card-submit" disabled={submitting}>
          {submitting ? busyLabel : submitLabel}
        </Button>
      </form>
      {footer && <p className="form-card-footer">{footer}</p>}
    </motion.section>
  );
}
