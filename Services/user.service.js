const User = require("../Models/user")
const { redisClient, dbSettings } = require('../app');
require('dotenv').config();

const userService = {}

userService.checkAuthCode = async(email, authCode) => {
    try {
        const redis_key = `${dbSettings.redis.base_key}_${email}_${authCode}`;
        const keyExists = await redisClient.exists(redis_key);
        
        return {
            success: keyExists === 1,
            message: keyExists === 1 ? '인증 성공' : '인증코드가 존재하지 않거나 만료되었습니다.'
        };
    } catch (error) {
        console.error('인증코드 확인 실패:', error);
        throw new Error("인증코드 확인 중 오류가 발생했습니다.");
    }
}

userService.saveUser = async(userName, sid) => {
    try {
        let user = await User.findOne({ name: userName });
        
        if (!user) {
            user = new User({
                name: userName,
                token: sid,
                online: true,
            });
        } else {
            user.token = sid;
            user.online = true;
        }

        await user.save();
        return user;
    } catch (error) {
        console.error('사용자 저장 실패:', error);
        throw new Error("사용자 저장 중 오류가 발생했습니다.");
    }
}

userService.checkUser = async(sid) => {
    const user = await User.findOne({ token: sid });
    if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
    }
    return user;
}

userService.logoutUser = async(sid) => {
    const user = await User.findOne({ token: sid });
    if(!user) throw new Error("user not found");
    
    // 유저 상태 업데이트
    user.token = null;
    user.online = false;
    await user.save();
    return user;
}

module.exports = userService;