export interface CommentItem {
    id: string;
    userId: string;
    userName: string;
    avatar: string;
    content: string;
    createdAt: Date;
}
export interface Comment {
    id: string;
    commentItemList: Array<CommentItem>;
}
