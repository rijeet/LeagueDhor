import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isProfileUrl', async: false })
export class IsProfileUrlConstraint implements ValidatorConstraintInterface {
  validate(profileUrl: string, args: ValidationArguments) {
    if (!profileUrl || typeof profileUrl !== 'string') {
      return false;
    }

    // Accept the new format: comma-separated platform:url pairs
    // Example: "facebook:https://facebook.com/user,instagram:https://instagram.com/user"
    const pairs = profileUrl.split(',');
    
    for (const pair of pairs) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        // If no platform prefix, validate as a URL (for backwards compatibility)
        try {
          const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
          new URL(url);
        } catch {
          return false;
        }
      } else {
        // Validate the URL part (after platform:)
        const urlPart = trimmed.substring(colonIndex + 1).trim();
        if (!urlPart) {
          return false;
        }
        
        try {
          const url = urlPart.startsWith('http') ? urlPart : `https://${urlPart}`;
          new URL(url);
        } catch {
          return false;
        }
      }
    }
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Profile URL must be a valid URL or in format "platform:url" (e.g., "facebook:https://facebook.com/user")';
  }
}

export function IsProfileUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProfileUrlConstraint,
    });
  };
}
