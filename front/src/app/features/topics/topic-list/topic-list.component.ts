import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Topic } from '../../../core/models';
import { TopicService, UserService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';

@Component({
  selector: 'app-topic-list',
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.scss'],
})
export class TopicListComponent implements OnInit {
  public topics: Topic[] = [];
  public loading = true;
  public error: string | null = null;

  /** Identifiants des thèmes suivis par l'utilisateur connecté. */
  private subscribedIds = new Set<number>();
  /** Thèmes dont la requête d'abonnement est en cours (désactive le bouton). */
  private pendingIds = new Set<number>();

  constructor(
    private readonly topicService: TopicService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.load();
  }

  public isSubscribed(topic: Topic): boolean {
    return this.subscribedIds.has(topic.id);
  }

  public isPending(topic: Topic): boolean {
    return this.pendingIds.has(topic.id);
  }

  public subscribe(topic: Topic): void {
    if (this.isSubscribed(topic) || this.isPending(topic)) {
      return;
    }

    this.pendingIds.add(topic.id);

    this.userService
      .subscribe(topic.id)
      .pipe(finalize(() => this.pendingIds.delete(topic.id)))
      .subscribe({
        next: () => {
          this.subscribedIds.add(topic.id);
          this.snackBar.open(`Abonné au thème « ${topic.title} »`, 'Fermer', {
            duration: 3000,
          });
        },
        error: (httpError: HttpErrorResponse) => {
          this.snackBar.open(
            toErrorMessage(httpError, "L'abonnement a échoué."),
            'Fermer',
            { duration: 4000 }
          );
        },
      });
  }

  public trackById(_index: number, topic: Topic): number {
    return topic.id;
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      topics: this.topicService.getAll(),
      user: this.userService.getCurrentUser(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ topics, user }) => {
          this.topics = topics;
          this.subscribedIds = new Set(
            user.subscribedTopics.map((topic) => topic.id)
          );
        },
        error: (httpError: HttpErrorResponse) => {
          this.error = toErrorMessage(
            httpError,
            'Impossible de charger les thèmes.'
          );
        },
      });
  }
}

