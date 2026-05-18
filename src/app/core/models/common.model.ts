export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface Tip {
    id?: string;
    title: string;
    description: string;
    codeSnippet?: string;
    language?: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt?: any;
    likes: number;
    isEdited?: boolean;
    isDeleted?: boolean;
    likedBy?: string[];
}

export interface GuideSlide {
    id: string;
    step: string;
    title: string;
    subtitle: string;
    content: string;
    details?: string[];
    imageUrl?: string;
    codeSnippet?: { language: string; code: string };
}
