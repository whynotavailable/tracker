export function summaryReport(trackers: Tracker[]) {
    for (let tracker of trackers) {
        console.log(tracker.date)
        console.log(tracker.description.trim())
        hr();
    }
}

export function totalsReport(trackers: Tracker[], { groupBy }: { groupBy: string}) {
    let groupedData = {};

    for (let tracker of trackers) {
        let groupKey = 'all';

        if (groupBy === 'day') {
            groupKey = tracker.date;
        }

        if (groupedData[groupKey] === undefined) {
            groupedData[groupKey] = {};
        }

        let group = groupedData[groupKey];

        for (let tag of tracker.tags) {
            group[tag] = group[tag] || 0;
        }

        for (let segment of tracker.segments) {
            if (segment.end === null) {
                // Ignore segments that haven't ended.
                console.log(`Segment that hasn't ended found on ${tracker.date} at ${segment.start}`)
                continue;
            }

            let start = timeToSpan(segment.start);
            let end = timeToSpan(segment.end);

            let diff = end - start;

            for (let tag of tracker.tags) {
                group[tag] += diff;
            }
        }
    }

    hr();

    for (let groupName of Object.keys(groupedData)) {
        console.log(`${groupName}:`);

        let group = groupedData[groupName];

        for (let tagName of Object.keys(group)) {
            let tag = group[tagName];
            console.log(`  ${tagName} -> ${diffToString(tag)}`)
        }
    }
}

function hr() {
    console.log('-------------');
}

function diffToString(diff: number): string {
    let hours = Math.floor(diff / 60);
    let minutes = diff % 60;
    return `${hours}:${minutes}`;
}

// Returns a minute value based on the time given. It counts from midnight
function timeToSpan(time: string): number {
    let returnValue = 0;

    let parts = time.split(' ');
    if (parts[1] === 'PM') {
        returnValue += 720;
    }

    let timeParts = parts[0].split(':');

    let hour = parseInt(timeParts[0]);

    hour = hour === 12 ? 0 : hour;

    returnValue += hour * 60;

    returnValue += parseInt(timeParts[1]);

    return returnValue;
}
