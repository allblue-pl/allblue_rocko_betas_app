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

indexDirPath = '../../electron';

config = {
    index: indexDirPath,

    dev: `${indexDirPath}/../web-app/dev`,
    dist: `${indexDirPath}/web-app/dist`,
    front: `${indexDirPath}/web-app/build/ab-web`,
    back: `${indexDirPath}/web-app/cache/abWeb`,
    tmp: `${indexDirPath}/web-app/tmp/ab-web`,
    
    base: '',
};

if (fs.existsSync(config.build))
    abFS.rmdirRecursiveSync(config.build);
if (fs.existsSync(config.cache))
    abFS.rmdirRecursiveSync(config.cache);

args.log();

abWeb.exec({
    _config: config,
    init: [ `./ab-web.js` ],
    exts: [ 'sass', 'js', 'js-libs', 'spocky', 'dist', 'copy', 'replace', ],
}, args.$('releaseType'));