import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field/Field';
import { FormCard } from '../components/FormCard/FormCard';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { EMAIL_RULES, required } from '../lib/validators';

const RULES = {
  email: EMAIL_RULES,
  password: [required('Enter your password.')],
};

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from ?? '/calendar';

  const form = useForm({
    initial: { email: '', password: '' },
    rules: RULES,
    onSubmit: async (values) => {
      await login(values);
      navigate(next, { replace: true });
    },
  });

  if (user) return <Navigate to={next} replace />;

  return (
    <div className="form-page">
      <FormCard
        title="Welcome back"
        intro="Log in to see your days."
        onSubmit={form.handleSubmit}
        formError={form.formError}
        submitting={form.submitting}
        submitLabel="Log in"
        busyLabel="Logging in…"
        footer={
          <>
            New here? <Link to="/register">Create an account</Link>
          </>
        }
      >
        <Field label="Email" type="email" autoComplete="email" required maxLength={254} {...form.field('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={72}
          {...form.field('password')}
        />
      </FormCard>
    </div>
  );
}
