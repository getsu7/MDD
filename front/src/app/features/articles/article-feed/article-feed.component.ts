import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Article } from '../../../core/models';
import { ArticleService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';

/** Sens de tri exposé par le contrôle « Trier par ». */
type SortDirection = 'desc' | 'asc';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-article-feed',
  templateUrl: './article-feed.component.html',
  styleUrls: ['./article-feed.component.scss'],
})
export class ArticleFeedComponent implements OnInit {
  public articles: Article[] = [];
  public sortDirection: SortDirection = 'desc';
  public loading = false;
  public error: string | null = null;

  private page = 0;
  private last = true;

  constructor(private readonly articleService: ArticleService) {}

  public ngOnInit(): void {
    this.reload();
  }

  /** Bascule le tri par date (croissant <-> décroissant) et recharge le fil. */
  public toggleSort(): void {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.reload();
  }

  public get hasMore(): boolean {
    return !this.last;
  }

  public loadMore(): void {
    if (this.loading || this.last) {
      return;
    }
    this.page += 1;
    this.fetch(true);
  }

  public reload(): void {
    this.page = 0;
    this.fetch(false);
  }

  public trackById(_index: number, article: Article): number {
    return article.id;
  }

  private fetch(append: boolean): void {
    this.loading = true;
    this.error = null;

    this.articleService
      .getFeed({
        page: this.page,
        size: PAGE_SIZE,
        sort: `createdAt,${this.sortDirection}`,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (page) => {
          this.articles = append
            ? [...this.articles, ...page.content]
            : page.content;
          this.last = page.last;
        },
        error: (httpError: HttpErrorResponse) => {
          this.error = toErrorMessage(
            httpError,
            'Impossible de charger le fil d’articles.'
          );
        },
      });
  }
}

