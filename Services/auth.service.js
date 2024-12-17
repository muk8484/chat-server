const { redisClient, dbSettings } = require('../app');
const { promisify } = require("util");
const nodemailer = require('nodemailer');
require('dotenv').config();

const authService = {}

// Redis 명령어들을 Promise 기반으로 변환
const scan = promisify(redisClient.scan).bind(redisClient);
const del = promisify(redisClient.del).bind(redisClient);

// SMTP 트랜스포터 생성
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD // 앱 비밀번호 사용
    }
});

authService.sendAuthEmail = async (toEmail, authCode) => {
    try {
        const redis_key = `${dbSettings.redis.base_key}_${toEmail}_${authCode}`;
        // 이메일 인증 기존 키 삭제
        await deleteEmailKeys(toEmail);
        // 키, 만료시간 설정
        const setEx = promisify(redisClient.setex).bind(redisClient);
        await setEx(redis_key, 30000, authCode)
            .catch((err) => console.error("Redis Error:", err));
        // 만료시간
        const ttl = promisify(redisClient.ttl).bind(redisClient);   
        const remaining = await ttl(redis_key);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: toEmail,
            subject: '인증번호 안내',
            html: `
                <div style="max-width: 400px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                        <div style="background-color: white; margin: 15px 0; padding: 15px; border-radius: 5px; text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">${authCode}</span>
                        </div>
                    </div>
                </div>
            `
        };
        const result = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('이메일 전송 실패:', error);
        throw new Error('인증 코드 전송 중 오류가 발생했습니다.');
    }
}

// 이메일 관련 기존 키 삭제 함수
async function deleteEmailKeys(email) {
    try {
        let cursor = '0';
        do {
            // SCAN 명령어로 키 검색
            const [newCursor, keys] = await scan(
                cursor,
                'MATCH', `*${email}_[0-9][0-9][0-9][0-9][0-9][0-9]*`,  // 이메일이 포함된 모든 키 검색
                'COUNT', '100'          // 한 번에 검색할 키 수
            );
            cursor = newCursor;

            // 찾은 키가 있으면 삭제
            if (keys.length > 0) {
                console.log(`Deleting keys for email ${email}:`, keys);
                await del(...keys);
            }

        } while (cursor !== '0'); // cursor가 0이 될 때까지 반복

        console.log(`Successfully deleted all keys containing email: ${email}`);
        return true;
    } catch (error) {
        console.error('Error deleting email keys:', error);
        throw error;
    }
}

module.exports = authService;