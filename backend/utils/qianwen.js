const fetch = require('node-fetch');

async function generateTravelPlan(input) {
    const apiKey = process.env.QIANWEN_API_KEY;
    if (!apiKey) throw new Error('Missing QIANWEN_API_KEY');

    // 通义千问API地址（请根据实际情况调整）
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    const prompt = `你是一位专业的旅行规划师。请根据以下需求生成一份详细的旅行计划，包含每日行程安排和预算分配：

${input}

请以JSON格式返回，包含以下字段：
{
    "title": "行程标题",
    "days": [
        {
            "day": 1,
            "date": "YYYY-MM-DD",
            "activities": ["活动1", "活动2"],
            "accommodation": "住宿信息",
            "transportation": "交通方式"
        }
    ],
    "budget": {
        "total": 数字,
        "currency": "CNY",
        "breakdown": {
            "transportation": 数字,
            "accommodation": 数字,
            "food": 数字,
            "activities": 数字,
            "others": 数字
        }
    },
    "tips": ["建议1", "建议2"]
}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-Algorithm': 'qwen-max'  // 使用通义千问max模型
            },
            body: JSON.stringify({
                model: 'qwen-max',
                input: {
                    messages: [
                        { role: 'system', content: '你是一个专业的旅行规划师。' },
                        { role: 'user', content: prompt }
                    ]
                },
                parameters: {
                    result_format: 'json'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        // 兼容通义千问新版和旧版返回结构
        let content = data.choices?.[0]?.message?.content || data.output?.text || data.output;
        let plan;
        try {
            // 只对字符串内容做 match
            let jsonStr = content;
            if (typeof content === 'string') {
                const match = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i);
                if (match) {
                    jsonStr = match[1];
                }
                plan = JSON.parse(jsonStr);
            } else {
                // content 不是字符串，直接返回
                plan = content;
            }
        } catch (e) {
            console.warn('Failed to parse AI response as JSON', e);
            plan = {
                error: 'Failed to parse AI response',
                rawResponse: data,
                rawContent: content
            };
        }
        return plan;
    } catch (error) {
        console.error('Error calling Qianwen API:', error);
        throw new Error('Failed to generate travel plan');
    }
}

module.exports = { generateTravelPlan };