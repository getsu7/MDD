import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article, CreateArticleRequest, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly baseUrl = `${environment.apiUrl}/articles`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/articles?page=&size=&sort= — fil paginé (défaut : createdAt,desc). */
  public getFeed(request: PageRequest = {}): Observable<Page<Article>> {
    let params = new HttpParams();
    if (request.page !== undefined) {
      params = params.set('page', request.page);
    }
    if (request.size !== undefined) {
      params = params.set('size', request.size);
    }
    params = params.set('sort', request.sort ?? 'createdAt,desc');

    return this.http.get<Page<Article>>(this.baseUrl, { params });
  }

  /** GET /api/articles/{id} */
  public getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/articles */
  public create(payload: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.baseUrl, payload);
  }
}

