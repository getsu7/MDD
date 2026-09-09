import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateProfileRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/user`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/user/me */
  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  /** PUT /api/user/me — champs `null` = inchangés côté backend. */
  public updateProfile(payload: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/me`, payload);
  }

  /** POST /api/user/subscriptions/{topicId} */
  public subscribe(topicId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/subscriptions/${topicId}`,
      null
    );
  }

  /** DELETE /api/user/subscriptions/{topicId} */
  public unsubscribe(topicId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subscriptions/${topicId}`);
  }
}

