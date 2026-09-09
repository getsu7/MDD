import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Topic } from '../models';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly baseUrl = `${environment.apiUrl}/topics`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/topics */
  public getAll(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.baseUrl);
  }
}

