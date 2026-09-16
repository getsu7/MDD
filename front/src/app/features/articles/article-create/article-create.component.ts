import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Topic } from '../../../core/models';
import { ArticleService, TopicService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.scss'],
})
export class ArticleCreateComponent implements OnInit {
  public topics: Topic[] = [];
  public submitting = false;
  public serverError: string | null = null;

  public readonly form = this.formBuilder.group({
    topicId: this.formBuilder.control<number | null>(null, Validators.required),
    title: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    content: this.formBuilder.nonNullable.control('', Validators.required),
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly topicService: TopicService,
    private readonly articleService: ArticleService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.topicService.getAll().subscribe({
      next: (topics) => (this.topics = topics),
      error: (httpError: HttpErrorResponse) => {
        this.serverError = toErrorMessage(
          httpError,
          'Impossible de charger les thèmes.'
        );
      },
    });
  }

  public submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const { topicId, title, content } = this.form.getRawValue();
    this.submitting = true;
    this.serverError = null;

    this.articleService
      .create({ topicId: topicId as number, title, content })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (article) => {
          this.snackBar.open('Article publié', 'Fermer', { duration: 3000 });
          void this.router.navigate(['/articles', article.id]);
        },
        error: (httpError: HttpErrorResponse) => {
          this.serverError = toErrorMessage(
            httpError,
            "L'article n'a pas pu être publié."
          );
        },
      });
  }
}

