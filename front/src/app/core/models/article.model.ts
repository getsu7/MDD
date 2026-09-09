export interface Article {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorUsername: string;
  topicId: number;
  topicTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  topicId: number;
}

