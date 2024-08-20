// Util functions
const { lettersOnly, strongPassword } = require("./regexValidators");

const validateAndCleanUserName = (username) => {
    username = username.trim().toLowerCase();
    let usernameLength = username.length;
    if(usernameLength == 0){
        return {value: username, verdict: false, message: "Username can not be empty"}
    }

    if(usernameLength < 3 || usernameLength > 15){
        return {value: username, verdict: false, message: "Username length is limited to 3 - 15 characters"}
    }

    if(!lettersOnly(username)){
        return {value: username, verdict: false, message: "Username should only contain letters."}
    }

    return {value: username, verdict: true}
}

const validatePassword = (password) => {
    let passwordLength = password.length;

    if(passwordLength == 0){
        return {value: password, verdict: false, message: "Password can not be empty"}
    }

    if(passwordLength < 6){
        return {value: password, verdict: false, message: "Your password should be at least 6 characters."}
    }

    if(!strongPassword(password)){
        return {value: password, verdict: false, message: "Your password should contain letters, numbers and special character"}
    }    

    return {value: password, verdict: true};
}

module.exports = {validateAndCleanUserName, validatePassword};
