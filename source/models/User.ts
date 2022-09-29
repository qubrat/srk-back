import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserScheme = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    roles: {
        type: [],
        required: true
    }
});

UserScheme.pre('save', function (next) {
    const user = this;

    if (this.isNew || this.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            else {
                bcrypt.hash(user.password!, salt, function (err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                });
            }
        });
    } else {
        return next();
    }
});

UserScheme.methods.comparePasswords = function (password: string, callback: (err: any, result: boolean) => void) {
    bcrypt.compare(password, this.password, function (error, isMatch) {
        if (error) {
            return callback(error, false)
        } else {
            callback(null, isMatch)
        }
    });
};

export default mongoose.model('User', UserScheme);
