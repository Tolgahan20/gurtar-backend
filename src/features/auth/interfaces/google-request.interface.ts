import { Request } from 'express';

export interface GoogleUser {
  id: string;
  email: string;
  displayName: string;
  picture: string;
}

export interface GoogleRequest extends Request {
  user?: GoogleUser;
}
