export function parser(data: string, date: string, empty: boolean, file: string): Tracker[] {
    let trackers: Tracker[] = [];
    let currentTracker: Tracker = null;

    let currentSegment: Segment = null;

    let currentPoint: Point = null;
    let tagsList = {};

    const lines = data.split('\n').map(x => x.trim());

    for (const line of lines) {
        if (currentTracker === null) {
            currentTracker = {
                description: '',
                segments: [],
                date,
                meta: {},
                todos: [],
                file,
                tags: []
            };

            trackers.push(currentTracker);
        }

        if (line === '---') {
            currentTracker = null;
            currentSegment = null;
            currentPoint = null;
            tagsList = {};
            continue;
        }

        if (/^[0-9]{1,2}:[0-9]{1,2}( am| pm)?( -)?( [0-9]{1,2}:[0-9]{1,2}( am| pm)?)?$/i.test(line)) {
            const parts = line.split('-')
            currentSegment = {
                start: getProperTime(parts[0]),
                end: getProperTime(parts[1] === void 0 ? parts[0] : parts[1]),
                description: '',
                meta: {},
                points: []
            }
            currentTracker.segments.push(currentSegment);

            currentPoint = null;
            continue;
        }

        if (currentSegment !== null && /^> [0-9]{1,2}:[0-9]{1,2}( am| pm)?$/i.test(line)) {
            currentPoint = {
                time: getProperTime(/[0-9]{1,2}:[0-9]{1,2}( am| pm)?/i.exec(line)[0]),
                description: ''
            }
            currentSegment.points.push(currentPoint);
            continue;
        }

        let todo = /^TODO: (.*?)(by ([0-9]{4}-[0-9]{2}-[0-9]{2}))?$/.exec(line);

        if (todo !== null) {
            currentTracker.todos.push({
                description: todo[1].trim(),
                by: todo[3] || null
            })
            continue;
        }

        let metaData = /^:([a-z\-]+):(.+?)$/.exec(line);

        if (metaData !== null) {
            if (currentSegment !== null) {
                currentSegment.meta[metaData[1]] = metaData[2]
            }
            else {
                currentTracker.meta[metaData[1]] = metaData[2];
            }

            continue;
        }

        let tags = [...line.matchAll(/#[a-z\-]+/g)].flat()

        if (tags.length > 0) {
            for (let tag of tags) {
                tagsList[tag] = true;
            }

            currentTracker.tags = Object.keys(tagsList);
        }

        if (currentPoint !== null) {
            currentPoint.description += `${line}\n`;
        }
        else if (currentSegment === null) {
            currentTracker.description += `${line}\n`;
        }
        else {
            currentSegment.description += `${line}\n`;
        }
    }

    if (empty) {
        return trackers;
    }
    else {
        return trackers.filter(x => x.segments.length > 0);
    }
}

function getProperTime(time: string): string {
    time = time.trim().toUpperCase();

    if (time === '') {
        return null;
    }

    if (time.indexOf('AM') === -1 && time.indexOf('PM') === -1) {
        const hourPart = parseInt(time.split(':')[0]);

        if (hourPart === 12) {
            time += ' PM';
        }
        else if (hourPart >= 7) {
            time += ' AM';
        }
        else {
            time += ' PM'
        }
    }

    return time;
}


