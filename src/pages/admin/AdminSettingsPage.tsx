import { useState } from 'react';
import { DEPARTMENTS, APP_CONFIG, ASSESSMENT_DEFAULTS } from '@/lib/constants';
import { Check, Settings2, Shield, Bell, Database, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card mb-5">
      <div className="card-header flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-gold" />
        <h2 className="font-semibold text-brand-navy text-sm">{title}</h2>
      </div>
      <div className="card-body space-y-5">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-brand-navy">{label}</div>
        {description && <div className="text-xs text-brand-muted mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-brand-navy' : 'bg-gray-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    duration: ASSESSMENT_DEFAULTS.durationMinutes,
    questionCount: ASSESSMENT_DEFAULTS.questionCount,
    passingScore: ASSESSMENT_DEFAULTS.passingPercentage,
    randomize: ASSESSMENT_DEFAULTS.randomize,
    allowRetakes: false,
    showResultsImmediately: true,
    emailNotifications: true,
    adminAlerts: true,
    requireDeptFilter: true,
  });

  const update = (key: keyof typeof settings, value: boolean | number) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration for {APP_CONFIG.name}</p>
        </div>
        <button onClick={handleSave} className={`btn-sm gap-2 ${saved ? 'btn-secondary text-success-600' : 'btn-primary'}`}>
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <>Save Changes</>}
        </button>
      </div>

      {/* Platform Info */}
      <Section title="Platform Information" icon={Database}>
        <SettingRow label="Platform Name">
          <span className="text-sm font-semibold text-brand-navy">{APP_CONFIG.name}</span>
        </SettingRow>
        <SettingRow label="Organisation">
          <span className="text-sm text-brand-muted">{APP_CONFIG.organization}</span>
        </SettingRow>
        <SettingRow label="Training Partner">
          <span className="text-sm text-brand-muted">{APP_CONFIG.trainingPartner}</span>
        </SettingRow>
        <SettingRow label="Version">
          <span className="text-sm text-brand-muted">{APP_CONFIG.version}</span>
        </SettingRow>
        <SettingRow label="Departments">
          <div className="flex flex-wrap gap-1.5 justify-end">
            {DEPARTMENTS.map((d) => (
              <span key={d.id} className="badge-gray text-xs">{d.code}</span>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Assessment Config */}
      <Section title="Assessment Configuration" icon={Settings2}>
        <SettingRow label="Assessment Duration" description="Time limit per assessment session">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.duration}
              onChange={(e) => update('duration', Number(e.target.value))}
              min={30} max={180} step={15}
              className="input w-20 text-center text-sm"
            />
            <span className="text-sm text-brand-muted">minutes</span>
          </div>
        </SettingRow>
        <SettingRow label="Questions per Assessment" description="Number of questions served per session">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.questionCount}
              onChange={(e) => update('questionCount', Number(e.target.value))}
              min={10} max={50} step={5}
              className="input w-20 text-center text-sm"
            />
            <span className="text-sm text-brand-muted">questions</span>
          </div>
        </SettingRow>
        <SettingRow label="Passing Score Threshold" description="Minimum percentage to be considered 'operational'">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.passingScore}
              onChange={(e) => update('passingScore', Number(e.target.value))}
              min={40} max={80} step={5}
              className="input w-20 text-center text-sm"
            />
            <span className="text-sm text-brand-muted">%</span>
          </div>
        </SettingRow>
        <SettingRow label="Randomise Questions" description="Shuffle question order for each session">
          <Toggle enabled={settings.randomize} onChange={(v) => update('randomize', v)} />
        </SettingRow>
        <SettingRow label="Allow Re-attempts" description="Let employees retake failed assessments">
          <Toggle enabled={settings.allowRetakes} onChange={(v) => update('allowRetakes', v)} />
        </SettingRow>
        <SettingRow label="Show Results Immediately" description="Display scores after submission">
          <Toggle enabled={settings.showResultsImmediately} onChange={(v) => update('showResultsImmediately', v)} />
        </SettingRow>
        <SettingRow label="Department-Filtered Questions" description="Serve department-specific questions alongside common ones">
          <Toggle enabled={settings.requireDeptFilter} onChange={(v) => update('requireDeptFilter', v)} />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <SettingRow label="Email Notifications" description="Send submission confirmations to employees">
          <Toggle enabled={settings.emailNotifications} onChange={(v) => update('emailNotifications', v)} />
        </SettingRow>
        <SettingRow label="Admin Completion Alerts" description="Notify admins when all employees in a department complete">
          <Toggle enabled={settings.adminAlerts} onChange={(v) => update('adminAlerts', v)} />
        </SettingRow>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <SettingRow label="Authentication Provider" description="Employee authentication method">
          <span className="badge-gray">Supabase Auth</span>
        </SettingRow>
        <SettingRow label="Session Timeout" description="Auto-logout idle sessions">
          <span className="badge-gray">90 minutes</span>
        </SettingRow>
        <SettingRow label="Admin Role">
          <button className="btn-secondary btn-sm gap-1.5">
            Manage Roles <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </SettingRow>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} className={`btn-lg gap-2 ${saved ? 'btn-secondary text-success-600' : 'btn-primary'}`}>
          {saved ? <><Check className="w-4 h-4" /> Changes Saved</> : 'Save All Settings'}
        </button>
      </div>
    </AdminLayout>
  );
}
