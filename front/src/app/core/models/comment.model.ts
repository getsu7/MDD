export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorUsername: string;
  articleId: number;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

