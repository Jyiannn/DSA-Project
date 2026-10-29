import { useState } from 'react';

const initialValues = { username: '', password: '', remember: false };

function validate(values) {
  const errors = {};
  if (!values.username.trim()) errors.username = 'Enter your username or email address.';
  if (!values.password) errors.password = 'Enter your password.';
  else if (values.password.length < 6) errors.password = 'Password must contain at least 6 characters.';
  return errors;
}

export default function SignupPage({ entering }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setNotice('');
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setNotice('This demo validates the form locally; connect it to your authentication service to sign in.');
    }
  };

  return (
    <section className={`signin-page ${entering ? 'signin-page--entering' : ''}`} aria-label="Sign in">
      <aside className="brand-panel">
        <img className="brand-panel__seal" src="/assets/university-seal.png" alt="University of Dagupan seal" />
        <div className="brand-panel__content">
          <h1><span>PARK</span><span>GANERN</span></h1>
          <p>A smart parking system that helps manage parking spaces and monitor vehicle entry and exit on campus.</p>
        </div>
        <div className="brand-panel__credits">
          <span>Developed By</span>
          <span>Jherome Pontawe</span>
          <span>Adrian Tenepere</span>
          <span>Liam Laki Oten</span>
        </div>
      </aside>

      <div className="signin-page__content">
        <form className="signin-card" noValidate onSubmit={submit}>
          <header className="signin-card__header">
            <span className="secure-icon"><img src="/assets/lock-keyhole.svg" alt="" /></span>
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to manage your parking workspace.</p>
            </div>
          </header>

          <div className="fields">
            <label className="field">
              <span>UserName</span>
              <input name="username" type="text" autoComplete="username" placeholder="you@company.com" value={values.username} onChange={update} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} />
              {errors.username && <small id="username-error" className="field__error">{errors.username}</small>}
            </label>

            <label className="field">
              <span>Password</span>
              <span className="password-control">
                <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={values.password} onChange={update} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
                <button type="button" className="visibility-button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <img src="/assets/eye.svg" alt="" />
                </button>
              </span>
              {errors.password && <small id="password-error" className="field__error">{errors.password}</small>}
            </label>
          </div>

          <div className="preferences">
            <label className="remember"><input name="remember" type="checkbox" checked={values.remember} onChange={update} /><span>Remember me</span></label>
            <button type="button" className="text-button" onClick={() => setNotice('Password recovery needs an authentication backend.')}>Forgot password?</button>
          </div>

          <button className="submit-button" type="submit">Sign in <img src="/assets/arrow-right.svg" alt="" /></button>
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </form>
      </div>
    </section>
  );
}
