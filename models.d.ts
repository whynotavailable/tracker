interface Point {
    time: string;
    description: string;
}

interface Todo {
    description: string;
    by: string;
}

interface Segment {
    // These are unix timestamps
    start: string;
    end: string;
    meta: Record<string, string>;
    description: string;
    points: Point[];
}

interface Tracker {
    description: string;
    date: string;
    tags: string[];
    meta: Record<string, string>;
    todos: Todo[];
    file: string;
    segments: Segment[];
}

interface ReportFilter {
    tag?: string;
    start?: string;
    end?: string;
    today?: boolean;
    week?: boolean;
    empty: boolean;
}
