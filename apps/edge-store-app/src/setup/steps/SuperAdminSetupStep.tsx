import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { setCacheSection, updateCache } from '../../lib/cache';
import { dateToIsoString } from '../../lib/datetimes';
import { checkAdminExists } from '../../lib/api';

interface ISuperAdminSetupStepProps {
  onComplete: () => void;
}

export const SuperAdminSetupStep = ({ onComplete }: ISuperAdminSetupStepProps) => {
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const exists = await checkAdminExists();

      if(exists){
        updateCache((cache) => { cache.setup.superAdminExists = true; });
        onComplete();
        return;
      }

      setIsCheckingAdmin(false);
    };

    checkAdmin();
  }, [onComplete]);

  if(isCheckingAdmin){
    return(
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm">Checking administrator status...</span>
      </div>
    );
  }

  const handleContinue = async () => {
    setError(null);

    if(!name.trim()){
      setError("Admin name is required.");
      return;
    }

    if(!email.trim()){
      setError("Admin email is required.");
      return;
    }

    if(!username.trim()){
      setError("Admin username is required.");
      return;
    }

    if(!/^\S+@\S+\.\S+$/.test(email.trim())){
      setError("Enter a valid email address.");
      return;
    }

    if(password.length < 8){
      setError("Password must be atleast 8 characters.");
      return;
    }

    if(password !== confirmPassword){
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setCacheSection("admin", {
      name: name.trim(),
      email: email.trim(),
      username: username.trim(),
      password: password
    });

    updateCache((cache) => {
      cache.setup.superAdminExists = true;
      cache.setup.lastBootstrapAt = dateToIsoString(new Date());
    });

    setIsSaving(false);
    onComplete();
  };


  return(
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Super Admin Setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the primary administrator account for this Edge Store installation.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 rounded-md border border-info/20 bg-info p-3">
            <ShieldCheck size={18} className="shrink-0 text-info-foreground" />
            <p className="text-xs text-info-foreground">
              This account will have full control over company settings, users, branches,
              licensing, and system configuration.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@edgestore.mw"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
            {isSaving ? "Creating Admin..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
}