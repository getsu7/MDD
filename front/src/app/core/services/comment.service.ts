import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CreateCommentRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly baseUrl = `${environment.apiUrl}/articles`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/articles/{articleId}/comments */
  public getByArticle(articleId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${articleId}/comments`);
  }

  /** POST /api/articles/{articleId}/comments */
  public create(
    articleId: number,
    payload: CreateCommentRequest
  ): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/${articleId}/comments`,
      payload
    );
  }
}

