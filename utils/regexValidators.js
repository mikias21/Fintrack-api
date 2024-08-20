const lettersOnly = (str) => {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(str);
}

const strongPassword = (password) => {
    const hasLetters = /[a-zA-Z]/;
    const hasNumbers = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    return hasLetters.test(password) && hasNumbers.test(password) && hasSpecialChar.test(password);
}

module.exports = {lettersOnly, strongPassword};