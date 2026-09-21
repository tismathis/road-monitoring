import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { Input } from '../components/console-ui/input';
import { Card, CardContent } from '../components/console-ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/console-ui/field';
import BayerGlobe from '../components/console-ui/bayer-globe';
import LiquidGlassButton from '../components/console-ui/glass-button';
import { NemopointMark } from '../components/console-ui/nemopoint-mark';

/**
 * LoginPage — shadcn login-04 block (form + cover panel inside one card),
 * retinted to the console's Infosys-blue-on-near-black palette. The cover
 * panel is a live dithered-globe canvas animation instead of a static image.
 *
 * The forgot-password link is decorative — matching the upstream shadcn
 * demo, which ships it the same way — since this backend has no
 * password-reset endpoint. Only Username/Password → Sign In is wired to
 * real auth.
 *
 * Wired to the real backend auth flow via useAuth() → POST /auth/login →
 * JWT stored by AuthContext; ProtectedRoute gates the rest of the app on it.
 */
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="gb-console relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-gb-background p-6 md:p-10">
      {/* Ambient background — the Nemopoint mark, oversized and near-invisible,
          held static behind the card rather than sitting as a UI element. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <NemopointMark size={4500} static className="shrink-0" />
      </div>

      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold text-gb-foreground">Welcome back</h1>
                  <p className="text-balance text-gb-muted-foreground">
                    Login to your RoadWatch account
                  </p>
                </div>

                {error && (
                  <div className="rounded-[6px] border border-gb-destructive/40 bg-gb-destructive/10 px-3 py-2.5 text-center text-[13px] text-gb-destructive">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter username"
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="ml-auto text-sm text-gb-muted-foreground underline-offset-2 hover:text-gb-foreground hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter password"
                  />
                </Field>

                <Field>
                  {/* Originkit "Light Glass Button" — wired in as returned; only the
                      fill/text colors are tweaked to the console's Infosys blue, the
                      cursor-tracking glass sheen and light-sweep animation are untouched. */}
                  <div
                    onClick={() => !loading && formRef.current?.requestSubmit()}
                    style={{
                      opacity: loading ? 0.6 : 1,
                      pointerEvents: loading ? 'none' : 'auto',
                      width: '100%',
                    }}
                  >
                    <LiquidGlassButton
                      label={loading ? 'Signing in…' : 'Login'}
                      colors={{ fill: '#007CC3', textColor: '#F1F6F8' }}
                      font={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 14 }}
                      padding="10px 16px"
                      rounded={30}
                      stroke={{
                        type: 'gradient',
                        angle: 180,
                        width: 1.5,
                        colorA: 'rgba(255, 255, 255, 0.55)',
                        colorB: 'rgba(255, 255, 255, 0.2)',
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Field>

                <FieldDescription className="text-center">
                  Infosys InStep Internship Project
                </FieldDescription>
              </FieldGroup>
            </form>

            <div className="relative hidden bg-gb-background-2 md:block">
              <BayerGlobe className="absolute inset-0" colorB="#007CC3" accent="#F1F6F8" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
