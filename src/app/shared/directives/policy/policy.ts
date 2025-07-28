export interface Policy {
  name: string;
  mustBePresent: boolean;
}

export class PolicyObject {
  [key: string]: boolean;

  constructor() {
    Object.keys(this).forEach((key) => {
      this[key] = false;
    });
  }
}
