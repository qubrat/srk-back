import { Request, Response, NextFunction } from "express";
import Log from '@/library/Logging'

export function logTraffic(req: Request, res: Response, next: NextFunction) {
    // Log the request
    Log.info(`Incoming -> Method: [${req.method}], URL: [${req.url}], IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        //Log response
        Log.info(`Outgoing -> Method: [${req.method}], URL: [${req.url}], IP: [${req.socket.remoteAddress}], Status: [${res.statusCode} ${res.statusMessage}]`);
    });
    next();
}