import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateService } from '../services/state.service';
import { IChannel, INodesRanking, IOldestNodes, ITopNodesPerCapacity, ITopNodesPerChannels } from '../interfaces/node-api.interface';

@Injectable({
  providedIn: 'root'
})
export class LightningApiService {
  private apiBaseUrl: string; // base URL is protocol, hostname, and port
  private apiBasePath = ''; // network path is /testnet, etc. or '' for mainnet

  constructor(
    private httpClient: HttpClient,
    private stateService: StateService,
  ) {
    this.apiBaseUrl = ''; // use relative URL by default
    if (!stateService.isBrowser) { // except when inside AU SSR process
      this.apiBaseUrl = this.stateService.env.NGINX_PROTOCOL + '://' + this.stateService.env.NGINX_HOSTNAME + ':' + this.stateService.env.NGINX_PORT;
    }
    this.apiBasePath = ''; // assume mainnet by default
    this.stateService.networkChanged$.subscribe((network) => {
      if (network === 'bisq' && !this.stateService.env.BISQ_SEPARATE_BACKEND) {
        network = '';
      }
      this.apiBasePath = network ? '/' + network : '';
    });
  }

  getNode$(publicKey: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/' + publicKey);
  }

  getNodGroupNodes$(name: string): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/group/' + name);
  }

  getChannel$(shortId: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/channels/' + shortId);
  }

  getChannelsByNodeId$(publicKey: string, index: number = 0, status = 'open'): Observable<any> {
    const params = new HttpParams()
      .set('public_key', publicKey)
      .set('index', index)
      .set('status', status)
    ;

    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/channels', { params, observe: 'response' });
  }

  getLatestStatistics$(): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/statistics/latest');
  }

  listNodeStats$(publicKey: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/' + publicKey + '/statistics');
  }

  getNodeFeeHistogram$(publicKey: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/' + publicKey + '/fees/histogram');
  }

  getNodesRanking$(): Observable<INodesRanking> {
    return this.httpClient.get<INodesRanking>(this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/rankings');
  }

  listChannelStats$(publicKey: string): Observable<any> {
    return this.httpClient.get<any>(this.apiBaseUrl + this.apiBasePath + '/channels/' + publicKey + '/statistics');
  }

  listStatistics$(interval: string | undefined): Observable<any> {
    return this.httpClient.get<any>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/statistics' +
      (interval !== undefined ? `/${interval}` : ''), { observe: 'response' }
    );
  }

  getTopNodesByCapacity$(): Observable<ITopNodesPerCapacity[]> {
    return this.httpClient.get<ITopNodesPerCapacity[]>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/rankings/liquidity'
    );
  }

  getTopNodesByChannels$(): Observable<ITopNodesPerChannels[]> {
    return this.httpClient.get<ITopNodesPerChannels[]>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/rankings/connectivity'
    );
  }

  getPenaltyClosedChannels$(): Observable<IChannel[]> {
    return this.httpClient.get<IChannel[]>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/penalties'
    );
  }

  getOldestNodes$(): Observable<IOldestNodes[]> {
    return this.httpClient.get<IOldestNodes[]>(
      this.apiBaseUrl + this.apiBasePath + '/api/v1/lightning/nodes/rankings/age'
    );
  }
}
