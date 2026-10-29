import { useState } from 'react';
import { ApiError } from '../lib/api';
import { runRules } from '../lib/validators';

// Form state with client rules, per-field touched tracking and server errors.
// `onSubmit(values)` may throw ApiError; its field errors land on the fields.
export function useForm({ initial, rules, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const clientErrors = runRules(rules, values);
  const visible = (name) => (touched[name] || submitted ? (serverErrors[name] ?? clientErrors[name]) : serverErrors[name]);

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setServerErrors((errors) => {
      const next = { ...errors };
      delete next[name];
      return next;
    });
    setFormError('');
  };

  // Spread onto <Field>: wires value, change, blur and the error message.
  const field = (name) => ({
    name,
    value: values[name],
    error: visible(name),
    onChange: (e) => setValue(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(clientErrors).length) {
      const first = Object.keys(clientErrors)[0];
      event.currentTarget.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initial);
    setTouched({});
    setServerErrors({});
    setSubmitted(false);
    setFormError('');
  };

  return { values, field, handleSubmit, submitting, formError, reset, setValue };
}
