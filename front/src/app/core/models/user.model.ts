import { Topic } from './topic.model';

export interface User {
  id: number;
  email: string;
  username: string;
  subscribedTopics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  email: string | null;
  username: string | null;
  password: string | null;
}

