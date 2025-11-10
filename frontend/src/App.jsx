import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import Auth from './components/Auth';
import VoiceInput from './components/VoiceInput';
import TravelPlan from './components/TravelPlan';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  useEffect(() => {
    // 检查当前会话状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) fetchPlans();
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPlans();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handlePlanSubmit = async (input) => {
    setCurrentPlan({ status: 'loading' });
    try {
      const response = await fetch(`${apiBase}/api/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({ input })
      });
      if (!response.ok) throw new Error('请求失败');
      const result = await response.json();
      let plan = result.data;
      // 自动提取 LLM 嵌套结构
      if (plan && plan.choices && plan.choices[0]?.message?.content) {
        let content = plan.choices[0].message.content;
        let jsonStr = content;
        if (typeof content === 'string') {
          const match = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i);
          if (match) {
            jsonStr = match[1];
          }
          try {
            plan = JSON.parse(jsonStr);
          } catch (e) {
            plan = { error: '解析AI返回内容失败', raw: content };
          }
        }
      }
      setCurrentPlan({ status: 'success', data: plan });
      if (session) fetchPlans(); // 刷新保存的行程列表
    } catch (error) {
      setCurrentPlan({ status: 'error', error: error.message });
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI 旅行规划师</h1>
        {session ? (
          <div className="user-info">
            <span>{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()}>退出</button>
          </div>
        ) : null}
      </header>

      {!session ? (
        <Auth />
      ) : (
        <main className="app-main">
          <section className="planner-section">
            <h2>创建新行程</h2>
            <VoiceInput onSubmit={handlePlanSubmit} />
            
            {currentPlan && (
              <div className="current-plan">
                <h3>当前行程</h3>
                {currentPlan.status === 'loading' && <div>生成中...</div>}
                {currentPlan.status === 'error' && (
                  <div className="error">{currentPlan.error}</div>
                )}
                {currentPlan.status === 'success' && (
                  <TravelPlan plan={currentPlan.data} />
                )}
              </div>
            )}
          </section>

          {plans.length > 0 && (
            <section className="history-section">
              <h2>历史行程</h2>
              <div className="plans-list">
                {plans.map((plan) => (
                  <div key={plan.id} className="plan-item">
                    <h4>{plan.plan.title || '未命名行程'}</h4>
                    <p>创建于: {new Date(plan.created_at).toLocaleString()}</p>
                    <button onClick={() => setCurrentPlan({ 
                      status: 'success', 
                      data: plan.plan 
                    })}>
                      查看详情
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}
