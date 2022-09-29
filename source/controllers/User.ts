import { NextFunction, Request, Response } from 'express';
import User from '@/models/User';

const createUser = (req: Request, res: Response, next: NextFunction) => {
    const { username, password, roles } = req.body;
    const user = new User({
        username: username,
        password: password,
        roles: roles
    });

    return user
        .save()
        .then(() => {
            res.status(200).json({ message: "User created" })
        })
        .catch((error) => res.status(500).json({ error }));
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    res.status(200).json({ message: "Succesfully logged in" })
};

export default { createUser, loginUser };
