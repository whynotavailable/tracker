#!/usr/bin/env node

import { Command } from 'commander'
import {parser} from "./parser";

import * as fs from 'fs'
import {parseISO, formatISO, eachDayOfInterval, startOfWeek, endOfWeek} from "date-fns";
import {summaryReport, totalsReport} from "./report";
import * as commander from "commander";

const program = new Command();

const { setup } = require('./setup');

program.command('setup')
    .description('Setup the current days file')
    .action(() => {
       setup();
    });

let reportCommand = program.command('report');

function setupReport(name: string): commander.Command {
    return reportCommand.command(name)
        .option('-t, --tag <tag>', 'tag to search against')
        .option('-s, --start <start>', 'start date')
        .option('-e, --end <end>', 'end date')
        .option('--today', 'filter just for today')
        .option('--week', 'filter just for current week')
}

setupReport('totals')
    .option('-b, --group-by <span>', 'what to group by (day, none)', 'day')
    .action((opt) => {
        const trackers = getFilteredTrackers(opt);
        totalsReport(trackers, opt);
    })

setupReport('summary')
    .action(opt => {
        const trackers = getFilteredTrackers(opt);
        summaryReport(trackers);
    })

function getFilteredTrackers(filter: ReportFilter) {
    let files: string[];

    if (filter.start) {
        let start = parseISO(filter.start);

        let end = new Date();

        if (filter.end) {
            end = parseISO(filter.end);
        }

        let days = eachDayOfInterval({
            start: start, end: end
        });

        files = days.map(x => formatISO(x, {
            representation: 'date'
        })).map(x => `${x}.trk`)
    }
    else if (filter.today) {
        files = [`${formatDate(new Date())}.trk`]
    }
    else if (filter.week) {
        let start = startOfWeek(new Date());
        let end = endOfWeek(new Date());

        let days = eachDayOfInterval({
            start: start, end: end
        });

        files = days.map(x => formatISO(x, {
            representation: 'date'
        })).map(x => `${x}.trk`)
    }
    else {
        files = fs.readdirSync('.').filter(x => x.endsWith('.trk'))
    }

    let trackers = files.flatMap(file => {
        return getTrackers(file);
    })

    if (filter.tag !== undefined) {
        trackers = trackers.filter(x => x.tags.indexOf(`#${filter.tag}`) !== -1)
    }

    return trackers;
}

function formatDate(date: Date): string {
    return formatISO(date, {
        representation: 'date'
    });
}

function getTrackers(file: string): Tracker[] {
    let parts = file.split('-');
    let archiveFile = `${parts[0]}/${parts[1]}/${file}`;

    let data = '';

    if (fs.existsSync(file)) {
        data = fs.readFileSync(file).toString();
    }
    else if (fs.existsSync(archiveFile)) {
        data = fs.readFileSync(archiveFile).toString()
    }
    else {
        return [];
    }

    return parser(data, file.split('.')[0]);
}

program.command('current')
    .description("get the current file (create it if it doesn't already exist)")
    .action(() => {
        const currentDate = formatISO(Date.now(), {
            representation: 'date'
        })

        const fileName = `${currentDate}.trk`

        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, '');
        }

        console.log(fileName);
    })

program.command('test')
    .action(() => {
        let d = parseISO('2020-11-19');
        //console.log(setHours(d, 32));
        const out = parser(fs.readFileSync('2020-01-01.trk').toString(), '2020-11-19');
    })

program.parse(process.argv);
