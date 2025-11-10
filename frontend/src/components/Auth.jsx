import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('请检查邮箱以完成注册！');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>{isLogin ? '登录' : '注册'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>
        <div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </div>
      </form>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
        >
          {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </div>
      {message && (
        <div style={{ marginTop: 10, color: message.includes('error') ? 'red' : 'green' }}>
          {message}
        </div>
      )}
    </div>
  );
}