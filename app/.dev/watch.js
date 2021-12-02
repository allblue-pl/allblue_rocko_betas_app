'use strict';

const 
    fs = require('fs'),
    abExecProcessor = require('ab-exec-processor'),
    abFS = require('ab-fs'),
    abLog = require('ab-log'),
    abWeb = require('ab-web')
;

let args = abExecProcessor.process(process.argv, 2, [
    {
        name: 'releaseType',
        aliases: [ '--releaseType', '-rt' ],
        default: true,
        required: true,
        values: [ 'dev', 'rel' ],
        defaultValue: 'dev',
    },
]);

let config = null;
let indexDirPath = null;
let buildDirPath = null;
let cacheDirPath = null;
let tmpDirPath = null;

indexDirPath = '../..';
buildDirPath = `${indexDirPath}/app/build/ab-web/web`;
cacheDirPath = `${indexDirPath}/app/cache/abWeb/web`;
tmpDirPath = `${indexDirPath}/app/tmp/ab-web/web`;

config = {
    tmp: tmpDirPath,
    front: buildDirPath,
    back: cacheDirPath,
    index: indexDirPath,
    base: '',
};

if (fs.existsSync(buildDirPath))
    abFS.rmdirRecursiveSync(buildDirPath);
if (fs.existsSync(cacheDirPath))
    abFS.rmdirRecursiveSync(cacheDirPath);

args.log();

abWeb.exec({
    _config: config,
    init: [ `./ab-web.js` ],
    exts: [ 'sass', 'js', 'js-libs', 'spocky', 'dist', 'copy', 'replace', ],
}, args.$('releaseType'));