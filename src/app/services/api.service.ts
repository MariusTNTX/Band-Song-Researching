import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private REST_API_SERVER = 'http://localhost:3000/';
  
  /* constructor(private httpClient: HttpClient){ }

  public get(path: string, headers = { 'content-type': 'application/json', 'Accept-Language': 'es' }, params?: any): Observable<any>{
    return this.httpClient.get(this.REST_API_SERVER + path, { headers, params });
  }

  public post(path: string, body = {}, headers = { 'content-type': 'application/json', 'Accept-Language': 'es' }): Observable<any>{
    return this.httpClient.post(this.REST_API_SERVER + path, body, { headers })
  }

  public put(path: string, body = {}, headers = { 'content-type': 'application/json', 'Accept-Language': 'es' }): Observable<any>{
    return this.httpClient.put(this.REST_API_SERVER + path, body, { headers })
  }

  public delete(path: string, body = {}): Observable<any>{
    return this.httpClient.delete(this.REST_API_SERVER + path, body)
  }

  public upload(path: string, file: FormData): Observable<any> {
    return this.httpClient.put(this.REST_API_SERVER + path, file)
  } */
}
