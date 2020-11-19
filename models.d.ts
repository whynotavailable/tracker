interface Point {
    time: string;

    description: string;
}

interface Segment {
    // These are unix timestamps
    start: string;
    end: string;

    description: string;

    points: Point[];
}

interface Tracker {
    description: string;
    date: string;
    tags: string[];
    segments: Segment[];
}

interface ReportFilter {
    tag?: string;
    start?: string;
    end?: string;
    today?: boolean;
    week?: boolean;
}
