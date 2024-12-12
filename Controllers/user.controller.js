const { trusted } = require("mongoose")
const User = require("../Models/user")
const userController = {}
const { redisClient } = require('../app');

userController.checkAuthCode = async(email, authCode)=>{
    console.log("checkAuthCode ", email, authCode);
    try{
        const redis_key = `${process.env.REDIS__BASE_KEY}_${email}_${authCode}`;

        const keyExists = await redisClient.exists(redis_key);
        if (!keyExists) {
            console.log('인증코드가 존재하지 않거나 만료되었습니다.');
            return {
                success: false,
                message: '인증코드가 존재하지 않거나 만료되었습니다.'
            };
        }
        return {
            success: true,
            message: '인증 성공'
        };

    }catch(error){
        throw new Error("auth code not found");
    }
}

userController.saveUser = async(userName, sid)=>{
    let user = await User.findOne({ name : userName})
    if(!user){
        user = new User({
            name: userName,
            token: sid,
            onLine: true,
        });
    }
    user.token = sid;
    user.online = true;

    await user.save();
    return user;
}

userController.checkUser = async(sid) => {
    const user = await User.findOne({ token: sid });
    if(!user) throw new Error("user not found");
    return user;
}

userController.logoutUser = async(sid) => {
    const user = await User.findOne({ token: sid });
    if(!user) throw new Error("user not found");
    
    // 유저 상태 업데이트
    user.token = null;
    user.online = false;
    await user.save();
    return user;
}

module.exports = userController