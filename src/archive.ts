import * as fs from 'fs'

export function archive(files: string[]) {
    for (let file of files) {
        let parts = file.split('-');

        let folder = `${parts[0]}/${parts[1]}`;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, {
                recursive: true
            });
        }

        fs.renameSync(file, `${folder}/${file}`);
    }
}
