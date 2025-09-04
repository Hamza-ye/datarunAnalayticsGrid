import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StateStorageService {
  private readonly previousUrlKey = 'previousUrl';
  private readonly accessTokenKey = 'app-accessToken';
  private readonly refreshTokenKey = 'app-refreshToken';
  // private readonly authenticationKey = 'app-authenticationToken';

  storeUrl(url: string): void {
    sessionStorage.setItem(this.previousUrlKey, JSON.stringify(url));
  }

  getUrl(): string | null {
    const previousUrl = sessionStorage.getItem(this.previousUrlKey);
    return previousUrl ? (JSON.parse(previousUrl) as string | null) : previousUrl;
  }

  clearUrl(): void {
    sessionStorage.removeItem(this.previousUrlKey);
  }

  storeAuthenticationToken(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    accessToken = JSON.stringify(accessToken);
    refreshToken = JSON.stringify(refreshToken);
    this.clearAuthenticationToken();
    if (rememberMe) {
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } else {
      sessionStorage.setItem(this.accessTokenKey, accessToken);
    }
  }

  getAuthenticationToken(): string | null {
    const authenticationToken = localStorage.getItem(this.accessTokenKey) ?? sessionStorage.getItem(this.accessTokenKey);
    return authenticationToken ? (JSON.parse(authenticationToken) as string | null) : authenticationToken;
  }

  clearAuthenticationToken(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
