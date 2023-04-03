import {
    registerDecorator,
    ValidatorConstraintInterface,
    ValidationArguments,
    ValidatorConstraint
  } from 'class-validator';

type AnyClass = { new (...args: any[]): any };
  
type PublicConstructor = new (...args: any[]) => any;
  
export type ClassValidationDecorator = <T extends AnyClass>(
  target: T,
) => PublicConstructor;
  

export function registerClassValidator(options: {
  name: string;
  validator: new () => ValidatorConstraintInterface;
  constraints: any[];
}): ClassValidationDecorator {
  return function decorateClass<T extends AnyClass>(
    target: T
  ): PublicConstructor {
    const { name, validator, constraints } = options;
    registerDecorator({
      name,
      target,
      propertyName: target.name,
      constraints,
      validator,
      options: {
        always: true
      }
    });

    return target;
  };
}

@ValidatorConstraint()
export class AtLeasOneConstraint implements ValidatorConstraintInterface {
  validate(value: undefined, args: ValidationArguments): boolean {
    return Object.keys(args.object).length > 0;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'At Least one field should be present';
  }
}

export function AtLeastOne(): ClassValidationDecorator {
  return registerClassValidator({
    name: 'AtleastOne',
    validator: AtLeasOneConstraint,
    constraints: []
  });
}