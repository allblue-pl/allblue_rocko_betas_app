'use strict';

const
    childProcess = require('child_process'),
    fs = require('fs'),
    path = require('path'),

    abFS = require('ab-fs')
;


async function createClip_Async(dBoulderBetas, clipFilePath) {
    return new Promise(async (resolve, reject) => {
        if (!abFS.existsDirSync('./tmp/system'))
            abFS.mkdirRecursiveSync('./tmp/system');

        let clipInfos = await getClipInfos_Async(dBoulderBetas);

        let duration = 0;
        for (let clipInfo of clipInfos)
            duration += clipInfo.duration;

        if (fs.existsSync(`'./tmp/system/clips.txt`))
            fs.unlinkSync(`'./tmp/system/clips.txt`);

        let filesStr = '';
        for (let i = 0; i < dBoulderBetas.length; i++)
            filesStr += (i > 0 ? '\r\n' : '') + `file '${dBoulderBetas[i].FilePath}'`;

        if (!abFS.dirExistsSync)
        fs.writeFileSync(`./tmp/system/clips.txt`, filesStr);

        if (fs.existsSync(`./tmp/system/betas.mp4`))
            fs.unlinkSync(`./tmp/system/betas.mp4`);

        childProcess.exec(`"./data/ffmpeg/bin/ffmpeg" -f concat -safe 0 -i "./tmp/system/clips.txt" -c copy -an "./tmp/system/betas.mp4"`, 
                async (err, stdOut, stdErr) => {
            if (err)
                reject(err);

            let musicFSPath = await getMusicFSPath_Async(duration);
            if (musicFSPath === null) {
                // fs.renameSync(`./tmp/system/betas.mp4`, clipFilePath);
                fs.copyFileSync(`./tmp/system/betas.mp4`, clipFilePath);
                fs.unlinkSync(`./tmp/system/betas.mp4`, clipFilePath);
                resolve({
                    clipInfos: clipInfos,
                });
                return;
            }

            if (fs.existsSync('./tmp/system/betas_music.mp4'))
                fs.unlinkSync('./tmp/system/betas_music.mp4');

            childProcess.exec(`"./data/ffmpeg/bin/ffmpeg" -i "./tmp/system/betas.mp4" -i "${musicFSPath}" -c copy -shortest "./tmp/system/betas_music.mp4"`,
                    (err, stdOut, stdErr) => {
                if (err)
                    reject(err);

                fs.unlinkSync(`./tmp/system/betas.mp4`);
                // fs.renameSync(`./tmp/system/betas_music.mp4`, clipFilePath);
                fs.copyFileSync(`./tmp/system/betas_music.mp4`, clipFilePath);
                fs.unlinkSync(`./tmp/system/betas_music.mp4`, clipFilePath);

                resolve({
                    clipInfos: clipInfos,
                });
            });
        });
    });
}
module.exports.createClip_Async = createClip_Async;


async function getClipInfos_Async(dBoulderBetas) {
    let clipInfos = [];

    for (let dBoulderBeta of dBoulderBetas) {
        let duration = await getClipDuration_Async(dBoulderBeta.FilePath);

        let clipInfo = {
            filePath: dBoulderBeta.FilePath,
            name: dBoulderBeta.Name,
            duration: duration,
        };

        clipInfos.push(clipInfo);
    }

    return clipInfos;
}
module.exports.getClipInfos_Async = getClipInfos_Async;


async function getClipDuration_Async(fsPath) {
    return new Promise((resolve, reject) => {
        childProcess.exec(`"./data/ffmpeg/bin/ffmpeg" -i "${fsPath}"`, (err, stdOut, stdErr) => {
            let betas = null;

            if (err !== null) {
                if (err.message.indexOf(
                        'At least one output file must be specified') === -1) {
                    reject(err);
                    return;
                }

                betas = err.message;
            } else {
                reject('Unknown error');
                return;
            }

            let startStr = 'Duration: ';
            let endStr = ', start:';

            let startPos = betas.indexOf(startStr);
            let endPos = betas.indexOf(endStr);

            if (startPos === -1) {
                reject('Cannot find duration start.');
                return;
            }
            if (endPos === -1) {
                reject('Cannot find duration end.');
                return;
            }
            
            try {
                let timeArr = betas.substring(startPos + startStr.length, endPos)
                        .split(':');

                let timeSeconds = 0;
                timeSeconds += Number(timeArr[2]);
                timeSeconds += Number(timeArr[1]) * 60;
                timeSeconds += Number(timeArr[0]) * 60 * 60;

                resolve(timeSeconds);
            } catch (err) {
                reject(err);
            };

            
        });
    });
}
module.exports.getClipDuration_Async = getClipDuration_Async;


async function getMusicFSPath_Async(minDuration) {
    return new Promise((resolve, reject) => {
        fs.readdir('./data/music', async (err, files) => {
            if (err !== null) {
                reject(err);
                return;
            }

            let musicFSPaths = [];

            for (let file of files) {
                if (file === '.' || file === '..')
                    continue;
                if (path.extname(file).toLowerCase() !== '.mp3')
                    continue;

                let music_FSPath = path.join('./data/music', file);
                let music_Duration =  await getClipDuration_Async(music_FSPath);

                if (music_Duration < minDuration)
                    continue;

                musicFSPaths.push(music_FSPath);
            }

            if (musicFSPaths.length === 0)
                resolve(null);

            resolve(musicFSPaths[Math.floor(Math.random() * musicFSPaths.length)]);
        });
    });
}
module.exports.getMusicFSPath_Async = getMusicFSPath_Async;