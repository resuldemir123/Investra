
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Rocket, Mail, Lock, User, ArrowRight, Github, Loader2, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login, register } = useAuth();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
        } catch (err: any) {
            console.error(err);
            setError(isLogin ?
                'Giriş yapılamadı. Bilgilerinizi kontrol edin.' :
                'Kayıt oluşturulamadı. Lütfen tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("Google girişi şu an bakımda. Lütfen e-posta ile devam edin.");
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
            </div>

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/20 transform rotate-3">
                        <Rocket size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Investra</h1>
                    <p className="text-slate-400 font-medium">Girişimcilik zekasını serbest bırak.</p>
                </div>

                <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 border border-slate-800">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {!isLogin && (
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Ad Soyad"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-600"
                                required
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="E-posta Adresi"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-600"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform active:scale-95 transition-all shadow-xl hover:shadow-cyan-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>{isLogin ? 'Platforma Gir' : 'Hesap Oluştur'} <Rocket size={18} /></>}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-800/50">
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transform active:scale-95 transition-all shadow-lg hover:bg-slate-100 flex items-center justify-center gap-3"
                    >
                        <Github size={18} /> Google İle Devam Et
                    </button>
                    <p className="mt-6 text-center text-slate-500 text-xs font-bold">
                        {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest ml-1"
                        >
                            {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
