const crypto = require('crypto');

class XunfeiSpeech {
  constructor(appId, apiKey) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.API_URL = 'http://api.xfyun.cn/v1/service/v1/iat';
  }

  // 生成请求头
  generateHeader() {
    const curTime = Math.floor(Date.now() / 1000);
    const param = { engine_type: 'sms16k', aue: 'raw' };
    const paramBase64 = Buffer.from(JSON.stringify(param)).toString('base64');
    const checkSum = crypto
      .createHash('md5')
      .update(this.apiKey + curTime + paramBase64)
      .digest('hex');

    return {
      'X-CurTime': curTime,
      'X-Param': paramBase64,
      'X-Appid': this.appId,
      'X-CheckSum': checkSum,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };
  }

  // 语音识别请求
  async recognize(audioData) {
    try {
      const headers = this.generateHeader();
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers,
        body: audioData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code !== '0') {
        throw new Error(data.desc);
      }

      return {
        success: true,
        result: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = XunfeiSpeech;