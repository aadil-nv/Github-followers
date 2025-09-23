import { AccessTokenPayload } from "./jwt.interface";


export interface AuthRequest extends Request {
  cookies: any;
  user?: AccessTokenPayload;
}