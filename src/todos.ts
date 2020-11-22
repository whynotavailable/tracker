import * as commander from "commander";
import * as fs from 'fs';
import * as _ from 'lodash'
import {getCurrentFiles, getTrackers} from "./index";
import {isAfter, isToday, isTomorrow, parseISO} from "date-fns";

export function setupTodos(program: commander.Command) {
    let todosCommand = program.command('todos')
        .description('work with todos');

    todosCommand.command('list')
        .description('display todos')
        .action(listTodos);
}

type todoState = 'pending' |
    'due today' |
    'due tomorrow' |
    'late' |
    'no due date';

function getState(date: Date): todoState {
   if (date === null) {
       return 'no due date';
   }

   if (isToday(date)) {
       return 'due today'
   }

   if (isAfter(new Date(), date)) {
       return 'late';
   }

   if (isTomorrow(date)) {
       return 'due tomorrow'
   }

   return 'pending'
}

function listTodos() {
    let files = getCurrentFiles();
    let todoFiles: string[] = [];

    if (fs.existsSync('todos.txt')) {
        todoFiles = fs.readFileSync('todos.txt')
            .toString()
            .split('\n')
            .map(x => x.trim())
            .filter(x => x !== '');

        files = [...files, ...todoFiles];
    }

    let trackers = files.flatMap(file => {
        return getTrackers(file, true);
    }).filter(x => x.todos.length > 0);

    let filesWithTodos = trackers.map(x => x.file);

    filesWithTodos = _.intersection(todoFiles, filesWithTodos);

    fs.writeFileSync('todos.txt', filesWithTodos.join('\n') + '\n');

    let todos = trackers.flatMap(x => x.todos.map(todo => {
        let date: Date = null;
        let sortKey = 0;

        if (todo.by !== null) {
            date = parseISO(todo.by)
            sortKey = date.getTime();
        }

        return {
            description: todo.description,
            by: todo.by,
            from: x.file,
            sortKey: sortKey,
            state: getState(date)
        }
    }))

    todos = _.sortBy(todos, ['sortKey']);

    let groupedTodos = _.groupBy(todos, 'state');

    for (let key of Object.keys(groupedTodos)) {
        let todos = groupedTodos[key];
        console.log(key)
        for (let todo of todos) {
            let by = todo.by === null ? '' : ` by ${todo.by}`
            console.log(`  ${todo.description}${by}\n    from file:./${todo.from}`)
        }
        console.log();
    }
}
