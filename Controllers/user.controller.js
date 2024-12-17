const userService = require('../Services/user.service');

const userController = {}

userController.checkAuthCode = async(email, authCode)=>{
    console.log("checkAuthCode ", email, authCode);
    try {
        const result = await userService.checkAuthCode(email, authCode);
        return result;
    } catch (error) {
        console.error('Controller - 인증코드 확인 실패:', error);
        throw error;
    }
}

userController.saveUser = async(userName, sid)=>{
    try {
        const user = await userService.saveUser(userName, sid);
        return user;
    } catch (error) {
        console.error('Controller - 사용자 저장 실패:', error);
        throw error;
    }
}

userController.checkUser = async(sid) => {
    try {
        const user = await userService.checkUser(sid);
        return user;
    } catch (error) {
        console.error('Controller_checkUser - 사용자 확인 실패:', error);
        throw error;
    }
}

userController.logoutUser = async(sid) => {
    try {
        const user = await userService.logoutUser(sid);
        return user;
    } catch (error) {
        console.error('Controller_logoutUser - 사용자 확인 실패:', error);
        throw error;
    }
}

module.exports = userController