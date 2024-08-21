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

const validateNumericAmount = (value) => {
    if((Number.isInteger(value) || typeof value === 'number' && !Number.isInteger(value))){
        return {value, verdict: true}
    }

    return {value, verdict: false, message: "Given amount is invalid, please input numeric value."}
}

const validateDateInputs = (date) => {
    const dateFormatRegex = /^\d{4}[-/]\d{2}[-/]\d{2}$/;
    if (!dateFormatRegex.test(date)) {
        return {value: date, verdict: false, message: "Invalid date format, choose date properly."};
    }

    const separator = date.includes('-') ? '-' : '/';
    const [year, month, day] = date.split(separator).map(Number);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return {value: date, verdict: false, message: "Choose proper value, incorrect date or month."};
    }

    // TODO: Year has to validated

    return {value: date, verdict: true}
}

module.exports = {validateAndCleanUserName, validatePassword, validateNumericAmount, validateDateInputs};
