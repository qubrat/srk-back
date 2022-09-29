import {NextFunction, Request, Response} from "express";
import Log from "@/library/Logging";

export const isAuthorized = (role: String) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const roles: any = req.user;
        if (req.isAuthenticated() && roles.roles.includes(role)) {
            next()
        } else {
            res.status(401).json({message: "Unathorized"})
        }
    }
}