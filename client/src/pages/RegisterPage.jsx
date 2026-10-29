import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field/Field';
import { FormCard } from '../components/FormCard/FormCard';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { checked, EMAIL_RULES, matches, NAME_RULES, PASSWORD_RULES, required } from '../lib/validators';

const RULES = {
  name: NAME_RULES,
  email: EMAIL_RULES,
  password: PASSWORD_RULES,
  confirm: [required('Type your password again.'), matches('password', 'Passwords don’t match.')],
  agree: [checked('Please agree to the terms to create an account.')],
};

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initial: { name: '', email: '', password: '', confirm: '', agree: false },
    rules: RULES,
    onSubmit: async ({ name, email, password }) => {
      await register({ name, email, password });
      navigate('/calendar', { replace: true });
    },
  });

  if (user) return <Navigate to="/calendar" replace />;

  return (
    <div className="form-page">
      <FormCard
        title="Create your account"
        intro="Your days are saved to your account, so they follow you to any device."
        onSubmit={form.handleSubmit}
        formError={form.formError}
        submitting={form.submitting}
        submitLabel="Create account"
        busyLabel="Creating account…"
        footer={
          <>
            Already have an account? <Link to="/login">Log in</Link>
          </>
        }
      >
        <Field label="Name" autoComplete="name" required minLength={2} maxLength={60} {...form.field('name')} />
        <Field label="Email" type="email" autoComplete="email" required maxLength={254} {...form.field('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          hint="At least 8 characters, with a letter and a number."
          {...form.field('password')}
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          {...form.field('confirm')}
        />
        <Field as="checkbox" label="I agree to keep my calendar honest." required {...form.field('agree')} />
      </FormCard>
    </div>
  );
}
