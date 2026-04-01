export interface PaginatedResponse<T> {
    data: T[];
    links:{
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };

    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface ApiValidationError{
    message: string;
    errors: Record<string, string[]>;
}

export interface ApiMessageResponse{
    message: string;
}