import * as fs from 'fs'
import {getTrackers} from "./index";

export function archive(files: string[]) {
    for (let file of files) {
        let trackers = getTrackers(file, true);

        let hasTodos = trackers.filter(x => x.todos.length > 0).length > 0;

        let parts = file.split('-');

        let folder = `${parts[0]}/${parts[1]}`;

        if (hasTodos) {
            fs.appendFileSync('todos.txt', `${folder}/${file}\n`)
        }

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, {
                recursive: true
            });
        }

        fs.renameSync(file, `${folder}/${file}`);
    }
}
