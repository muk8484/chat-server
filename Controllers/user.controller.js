const { trusted } = require("mongoose")
const User = require("../Models/user")
const userController = {}

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