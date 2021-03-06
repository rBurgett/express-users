var VError = require('verror');
var crypto = require('crypto');

module.exports = function () {
    function encrypt(pwd, salt) {
        return crypto.createHash('sha1').update(pwd + salt).digest('hex');
    }
    function generateSalt() {
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        return crypto.createHash('sha1').update(current_date + random).digest('hex');
    }

    return {
        // return updated user
        //
        // @param user  the sanitized user object
        // @param next  callback when user object is updated `function (error, user)`
        hashPassword: function sha1(user, next) {
            var salt = generateSalt();
            user.password = encrypt(user.password, salt);
            user.salt = salt;
            user.passwordStrategy = 'salt';
            next(null, user);
        },
        // Check given password match given user's password.
        // @param   user        the user object
        // @param   password    the password string to check
        // @param   next        function (err, processed)
        checkPassword: function (user, password, next) {
            if (user.passwordStrategy !== 'salt') {
                next(null, false);
            }
            if (encrypt(password, user.salt) === user.password) {
                return next(null, true);
            }

            next(new VError('Password does not match.'));
        }
    };
};
