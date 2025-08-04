import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from '../interfaces/google-request.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const options: StrategyOptions = {
      clientID: configService.get('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    };
    super(options);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUser> {
    const { id, displayName, emails, photos } = profile;

    if (!emails?.[0]?.value || !photos?.[0]?.value) {
      throw new Error('Invalid profile data from Google');
    }

    const user: GoogleUser = {
      id,
      email: emails[0].value,
      displayName,
      picture: photos[0].value,
    };

    return Promise.resolve(user);
  }
}
