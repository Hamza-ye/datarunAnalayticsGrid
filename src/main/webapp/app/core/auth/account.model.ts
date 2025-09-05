export class Account {
  constructor(
    public activated: boolean,
    public authorities: AppAuthority[],
    public email: string,
    public firstName: string | null,
    public langKey: string,
    public lastName: string | null,
    public username: string,
    public imageUrl: string | null,
  ) {}
}

export class AppAuthority {
  constructor(public authority: string) {}
}
