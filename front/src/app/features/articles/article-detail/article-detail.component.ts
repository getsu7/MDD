import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Article, Comment } from '../../../core/models';
import { ArticleService, CommentService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  public article: Article | null = null;
  public comments: Comment[] = [];
  public loading = true;
  public error: string | null = null;
  public sending = false;

  public readonly commentForm = this.formBuilder.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  private articleId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  public submitComment(): void {
    if (this.commentForm.invalid || this.sending) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.sending = true;

    this.commentService
      .create(this.articleId, this.commentForm.getRawValue())
      .pipe(finalize(() => (this.sending = false)))
      .subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];
          this.commentForm.reset();
        },
        error: (httpError: HttpErrorResponse) => {
          this.snackBar.open(
            toErrorMessage(httpError, "Le commentaire n'a pas pu être publié."),
            'Fermer',
            { duration: 4000 }
          );
        },
      });
  }

  public trackById(_index: number, comment: Comment): number {
    return comment.id;
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      article: this.articleService.getById(this.articleId),
      comments: this.commentService.getByArticle(this.articleId),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ article, comments }) => {
          this.article = article;
          this.comments = comments;
        },
        error: (httpError: HttpErrorResponse) => {
          this.error = toErrorMessage(httpError, 'Article introuvable.');
        },
      });
  }
}

