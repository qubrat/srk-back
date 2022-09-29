import passport from 'passport'
import LocalStrategy from 'passport-local'
import User from "../models/User"
import {validatePassword} from "@/library/PasswordVerification"


const verifyCallback = (username: string, password: string, done: any) => {
    User.findOne({username: username})
        .then((user) => {
            if (!user) return done(null, false);

            validatePassword(password, user.password)
                .then((isValid) => {
                    if (isValid) return done(null, user)
                    else return done(null, false);
                })
                .catch((err) => {
                    return done(null, false)
                })
        })
        .catch((err) => {
            done(err)
        })
}

const strategy = new LocalStrategy.Strategy(verifyCallback);

passport.use(strategy)

passport.serializeUser((user: any, done) => {
    done(null, user.id);
    
})

passport.deserializeUser((userId: string, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err);
        })
})



