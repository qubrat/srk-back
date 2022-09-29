import express from "express";
import controller from "@/controllers/User";
import passport from "passport";

const router = express.Router();

router.post('/signup', controller.createUser);
router.post('/login', passport.authenticate('local'), controller.loginUser);
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/logoutRoute');
    });

})

export = router;
