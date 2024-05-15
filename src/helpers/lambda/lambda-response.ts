export interface ErrorResponse {
    error: {
        message: string;
        type: string;
    };
}

export function getErrorResponse(error: unknown): ErrorResponse {
    if (error instanceof Error) {
        return {
            error: {
                message: error.message,
                type: error.name,
            },
        };
    }

    return {
        error: {
            message: 'Unexpected error',
            type: 'SystemException',
        },
    };
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}
