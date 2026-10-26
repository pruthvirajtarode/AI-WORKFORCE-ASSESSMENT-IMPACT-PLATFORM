import { Link } from 'react-router-dom';
import { Brain, BarChart3, Shield, Target, ArrowRight, Building2, Star, Zap, CheckCircle } from 'lucide-react';
import { ROUTES, APP_CONFIG } from '@/lib/constants';

const features = [
  {
    icon: Target,
    title: 'Real Workplace Scenarios',
    desc: 'Assessment questions based on actual Suroj Buildcon workflows — not textbook theory.',
  },
  {
    icon: Brain,
    title: 'AI Competency Mapping',
    desc: '10 competency areas from prompt engineering to department-specific AI application.',
  },
  {
    icon: BarChart3,
    title: 'Post-Training Impact Analysis',
    desc: 'Measure AI adoption from the Be10x workshop with department-wise scoring and analytics.',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Platform',
    desc: 'Secure, auditable, with department-wise analytics for leadership decision-making.',
  },
];

const departments = [
  'EPC Bids & Design-Build',
  'Accounts & Finance',
  'People, Admin & Communication',
  'Cost, Planning & Systems',
  'Procurement & Stores',
  'Design, Drawings & Quantities',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-navy text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-navy" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-brand-gold">SUROJ × BE10X</div>
              <div className="text-[10px] text-white/50">AI Workforce Assessment</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.adminLogin}
              className="btn btn-sm text-white/70 hover:text-white hover:bg-white/10 no-underline"
            >
              Admin
            </Link>
            <Link
              to={ROUTES.employeeOnboarding}
              className="btn btn-sm bg-brand-gold text-brand-navy hover:bg-brand-gold-dark font-semibold no-underline"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3.5 h-3.5 text-brand-gold" />
          <span className="text-xs text-brand-gold font-semibold tracking-wide uppercase">Post-Training AI Readiness Platform</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
          Measure Your Team's<br />
          <span className="text-brand-gold">AI Transformation</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          The enterprise assessment platform for Suroj Buildcon employees — evaluating real AI skills, 
          not just training attendance. Powered by Be10x methodology.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            to={ROUTES.employeeOnboarding}
            className="btn bg-brand-gold text-brand-navy hover:bg-brand-gold-dark font-semibold btn-lg w-full sm:w-auto no-underline"
          >
            Start Your Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to={ROUTES.adminLogin}
            className="btn border border-white/20 text-white hover:bg-white/10 btn-lg w-full sm:w-auto no-underline"
          >
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '6', label: 'Departments' },
            { value: '200+', label: 'Questions' },
            { value: '10', label: 'AI Competencies' },
            { value: '90', label: 'Minutes / Assessment' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-brand-gold">{value}</div>
              <div className="text-sm text-white/50 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Built for Suroj Buildcon Professionals</h2>
          <p className="text-white/50">Not a generic quiz — a precision instrument for enterprise AI adoption measurement</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-gold" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-brand-gold" />
            <h2 className="text-lg font-semibold text-white">Department-Specific Assessments</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <div key={dept} className="flex items-center gap-2.5 text-sm text-white/70">
                <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Star className="w-8 h-8 text-brand-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Measure Your AI Readiness?</h2>
          <p className="text-white/50 mb-6 text-sm">Enter your name and department to begin</p>
          <Link
            to={ROUTES.employeeOnboarding}
            className="btn bg-brand-gold text-brand-navy hover:bg-brand-gold-dark font-semibold btn-lg no-underline"
          >
            Begin Assessment <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>© 2024 Suroj Buildcon. AI Workforce Assessment powered by Be10x.</span>
          <span>Platform v{APP_CONFIG.version}</span>
        </div>
      </footer>
    </div>
  );
}
