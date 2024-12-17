const nodemailer = require('nodemailer');
const authService = require('../Services/auth.service');
require('dotenv').config();

const authController = {};

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

// 이메일 인증 메일 발송 함수
authController.sendAuthEmail = async (toEmail, authCode) => {
    try {
        const result = await authService.sendAuthEmail(toEmail, authCode);
        return result;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error(`이메일 발송 실패: ${error.message}`);
    }
};

module.exports = authController;

// 서버 시작 시 연결 테스트
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP 연결 오류:', error);
    } else {
        console.log('SMTP 서버 연결 성공');
    }
});