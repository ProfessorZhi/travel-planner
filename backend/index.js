const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { generateTravelPlan } = require('./utils/qianwen');
const xunfeiRouter = require('./routes/xunfei');

const app = express();
app.use(cors());
app.use(express.json());

// 添加讯飞语音识别路由
app.use('/api/xunfei', xunfeiRouter);

const PORT = process.env.PORT || 3000;

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 后端管理员客户端（使用 service role key），用于绕过 RLS 在服务端插入/查询
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('Supabase URL:', !!process.env.SUPABASE_URL ? process.env.SUPABASE_URL : 'MISSING');
console.log('Has SUPABASE_ANON_KEY:', !!process.env.SUPABASE_ANON_KEY);
console.log('Has SUPABASE_SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_KEY);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 临时调试接口：直接使用 supabaseAdmin 插入一条测试记录（本地调试用）
// 注意：部署到生产前请移除此接口，避免滥用 service key
app.post('/api/debug/insert-test', async (req, res) => {
  try {
    const payload = {
      user_id: req.body.user_id || '00000000-0000-0000-0000-000000000000',
      input: req.body.input || 'debug test',
      plan: req.body.plan || { title: 'debug plan' },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('travel_plans')
      .insert([payload]);

    if (error) return res.status(500).json({ success: false, error });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 获取用户行程列表
app.get('/api/plans', async (req, res) => {
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  if (!userToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError) throw authError;

    // 使用管理员客户端查询，避免 RLS 导致的权限问题
    const { data, error } = await supabaseAdmin
      .from('travel_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 行程规划接口
app.post('/api/plan', async (req, res) => {
  const userInput = req.body?.input || '';
  const userToken = req.headers.authorization?.replace('Bearer ', '');

  try {
    // 调用通义千问生成行程
    const plan = await generateTravelPlan(userInput);

    // 如果用户已登录，保存行程到数据库
    if (userToken) {
      try {
        const { data: { user } } = await supabase.auth.getUser(userToken);
        if (user) {
              // 使用管理员客户端插入
              const { data: insertData, error: insertError } = await supabaseAdmin
                .from('travel_plans')
                .insert([
                  {
                    user_id: user.id,
                    input: userInput,
                    plan: plan,
                    created_at: new Date().toISOString()
                  }
                ]);
              if (insertError) console.error('Failed to save plan:', insertError);
        }
      } catch (err) {
        console.error('Failed to verify user token:', err);
      }
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    console.error('Failed to generate plan:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
