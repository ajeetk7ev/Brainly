import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
interface AuthRequest extends Request {
    id?: string; 
}
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {


        const token = req.headers.authorization?.split(' ')[1];

        console.log("TOKEN IS ",token);

        // If no token is found
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication token is missing'
            });
        }

        // Verify the token
        //@ts-ignore
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            console.log("DECODE VALUE IS ",decoded);

            //@ts-ignore
            req.userId = decoded?.id;
            // Proceed to the next middleware or route handler
            next();

        })

        } catch (error) {
            console.log("Error in authMiddleware ",error);
            res.status(500).json({
                success:false,
                message:"internal server error"
            })
        }
    }


