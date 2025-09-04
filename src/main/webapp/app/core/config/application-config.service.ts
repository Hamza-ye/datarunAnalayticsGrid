import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApplicationConfigService {
  private endpointPrefix = '';
  private microfrontend = false;

  setEndpointPrefix(endpointPrefix: string): void {
    this.endpointPrefix = endpointPrefix;
  }

  setMicrofrontend(microfrontend = true): void {
    this.microfrontend = microfrontend;
  }

  isMicrofrontend(): boolean {
    return this.microfrontend;
  }

  getEndpointFor(api: string, microservice?: string): string {
    // Ensure `api` starts with "api/"
    // const normalizedApi = api.startsWith('api/') ? api.replace(/^api\//, 'api/v1/') : `api/v1/${api}`;

    if (microservice) {
      return `${this.endpointPrefix}services/${microservice}/${api}`;
    }
    return `${this.endpointPrefix}${api}`;
  }
}
