const express = require('express');
const XunfeiSpeech = require('../utils/xunfei');

const router = express.Router();

// 初始化讯飞语音识别
const xunfei = new XunfeiSpeech(
  process.env.XUNFEI_APP_ID,
  process.env.XUNFEI_API_KEY
);

// 启动语音识别会话
router.post('/start', async (req, res) => {
  try {
    // 这里可以进行会话初始化，返回临时凭证等
    // 实际项目中可能需要进行更复杂的处理
    res.json({
      success: true,
      data: {
        sessionId: Date.now().toString(),
        // 可以返回 WebSocket 连接信息等
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 语音识别（同步API示例）
router.post('/recognize', express.raw({ type: 'audio/*' }), async (req, res) => {
  try {
    const result = await xunfei.recognize(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;