'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SupabaseMock, Course } from '@/lib/supabase';
import { CreditCard, CheckCircle, ShieldCheck, Sparkles, ArrowRight, Lock } from 'lucide-react';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [recommendedCourse, setRecommendedCourse] = useState<Course | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = SupabaseMock.getCurrentUserEmail();
    const userName = SupabaseMock.getCurrentUserName();
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userName) {
      setName(userName);
    }

    if (courseId) {
      const course = SupabaseMock.getCourses().find(c => c.id === courseId);
      if (course) {
        setRecommendedCourse(course);
      }
    }
  }, [courseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    setTimeout(() => {
      // 1. Enroll user in active state
      SupabaseMock.enrollUser(email, 'active');
      
      // 2. Ensure current session knows user is subscribed
      SupabaseMock.login(email, name, 'student');
      document.cookie = `clube_flix_user_email=${email}; path=/; max-age=86400`;
      document.cookie = `clube_flix_user_role=student; path=/; max-age=86400`;
      document.cookie = `clube_flix_is_subscribed=true; path=/; max-age=86400`;

      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/vitrine');
      }, 2000);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', width: '100%' }}>
      {/* Small Header */}
      <header className="glass" style={{ padding: '16px 5%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <div 
          style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontFamily: 'var(--font-title)', cursor: 'pointer' }} 
          onClick={() => router.push('/')}
        >
          <span style={{ 
            fontSize: '8px', 
            fontWeight: 700, 
            color: '#7a8b9e', 
            letterSpacing: '2.5px', 
            textTransform: 'uppercase',
            marginBottom: '3px'
          }}>
            PROFESSOR CLAUDIO BRUM
          </span>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 900, 
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#ffffff' }}>CLUBE</span>
            <span style={{ color: '#c9a84c', margin: '0 1px', fontWeight: 900, transform: 'translateY(1px)' }}>_</span>
            <span style={{ color: '#c9a84c' }}>FLIX</span>
          </span>
        </div>
        <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Secure Checkout
        </span>
      </header>

      <main style={{ flex: 1, padding: '40px 5%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {success ? (
          <div className="glass" style={{ padding: '60px 40px', borderRadius: 24, textAlign: 'center', maxWidth: 460 }}>
            <div style={{ color: '#22c55e', display: 'inline-flex', marginBottom: 20 }}>
              <CheckCircle size={64} className="floating" />
            </div>
            <h2 style={{ fontSize: 28, marginBottom: 12, fontFamily: 'var(--font-title)' }}>Assinatura Confirmada!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.5 }}>
              Seja bem-vindo ao Clube Flix, {name}. Seu pagamento recorrente foi aprovado. Redirecionando para a vitrine...
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, width: '100%', maxWidth: 960
          }}>
            {/* Payment Details */}
            <div className="glass" style={{ padding: 40, borderRadius: 24 }}>
              <h2 style={{ fontSize: 24, marginBottom: 8, fontFamily: 'var(--font-title)' }}>Detalhes do Pagamento</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={14} /> Transação encriptada com segurança SSL de ponta a ponta
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nome Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Ex: João Silva" 
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>E-mail para Acesso</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="seuemail@gmail.com" 
                      className="input-field" 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Número do Cartão de Crédito</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      required 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))} 
                      placeholder="4000 1234 5678 9010" 
                      className="input-field" 
                      style={{ paddingLeft: 46 }}
                    />
                    <CreditCard size={18} style={{ position: 'absolute', left: 16, top: 18, color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Validade (MM/AA)</label>
                    <input 
                      type="text" 
                      required 
                      value={cardExpiry} 
                      onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))} 
                      placeholder="12/29" 
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CVV</label>
                    <input 
                      type="password" 
                      required 
                      value={cardCvv} 
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))} 
                      placeholder="123" 
                      className="input-field" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px 20px', fontSize: 16, marginTop: 10 }}>
                  {loading ? 'Processando transação...' : `Confirmar Assinatura (${plan === 'monthly' ? 'R$ 49,90/mês' : 'R$ 399,00/ano'})`} <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Plan Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Plan Choice card */}
              <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontSize: 18, marginBottom: 16, fontFamily: 'var(--font-title)' }}>Selecione o Plano</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 16, borderRadius: 8, cursor: 'pointer', border: plan === 'monthly' ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                    background: plan === 'monthly' ? 'rgba(201, 168, 76, 0.05)' : 'transparent'
                  }}>
                    <div>
                      <input type="radio" name="plan" checked={plan === 'monthly'} onChange={() => setPlan('monthly')} style={{ marginRight: 10 }} />
                      <strong style={{ fontSize: 14 }}>Plano Mensal</strong>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>R$ 49,90<span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-muted)' }}>/mês</span></span>
                  </label>

                  <label style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 16, borderRadius: 8, cursor: 'pointer', border: plan === 'yearly' ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                    background: plan === 'yearly' ? 'rgba(201, 168, 76, 0.05)' : 'transparent'
                  }}>
                    <div>
                      <input type="radio" name="plan" checked={plan === 'yearly'} onChange={() => setPlan('yearly')} style={{ marginRight: 10 }} />
                      <strong style={{ fontSize: 14 }}>Plano Anual</strong>
                      <span style={{ display: 'block', fontSize: 10, color: '#22c55e', marginLeft: 24 }}>Economize 33%</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>R$ 399,00<span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-muted)' }}>/ano</span></span>
                  </label>
                </div>
              </div>

              {/* Recommended Course summary if applicable */}
              {recommendedCourse && (
                <div className="glass" style={{ padding: 24, borderRadius: 20, border: '1px solid rgba(121, 40, 202, 0.3)' }}>
                  <span style={{ fontSize: 10, color: '#a855f7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <Sparkles size={12} /> TRILHA RECOMENDADA NO DIAGNÓSTICO
                  </span>
                  <h4 style={{ fontSize: 15, marginBottom: 6 }}>{recommendedCourse.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.4 }}>
                    Sua matrícula dará acesso completo a este curso e a todo o catálogo do Professor Cláudio Brum!
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="glass" style={{ padding: 20, borderRadius: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ color: '#22c55e' }}><ShieldCheck size={28} /></div>
                <div>
                  <h5 style={{ fontSize: 13, marginBottom: 2 }}>Bunny & Panda Stream Security</h5>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Transmissão criptografada, proteção anti-download e marca d&apos;água flutuante.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'var(--bg-deep)' }}>Carregando checkout seguro...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
