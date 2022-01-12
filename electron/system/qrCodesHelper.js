'use strict';

const 
    fs = require('fs'),

    abFS = require('ab-fs'),
    sharp = require('sharp'),
    textToSVG = require('text-to-svg').loadSync('./data/fonts/OpenSans-Regular.ttf'),
    qrcode = require('qrcode')
;

const
    yTop = 320,
    yOffset = 160,

    qrScale = 4,
    textXOffset = 270,
    textYOffset = 30,

    urlsYOffset = 70,
    urlsFontSize = 20,

    namesFontSize = 50    
;

async function createQRCodes_Async(clipInfos, ytLink, qrCodesLocation) {
    if (!abFS.existsDirSync('./tmp/system/qrCodes'))
        abFS.mkdirRecursiveSync('./tmp/system/qrCodes');
    
    for (let i = 0; i < clipInfos.length; i++) {
        let name = clipInfos[i].name;
        let url = getUrl(clipInfos, ytLink, i);

        abFS.mkdirRecursiveSync('./tmp/system/qrCodes');

        await createQRCodeImage_Async(i, url);
    }

    /* QR Overlay */
    fs.copyFileSync(`./data/images/background.png`, `./tmp/system/qrCodes.png`);
    await addQRCodeOverlays_Async(clipInfos);

    // fs.renameSync(`./tmp/system/qrCodes.png`, qrCodesLocation);
    fs.copyFileSync(`./tmp/system/qrCodes.png`, qrCodesLocation);
    fs.unlinkSync(`./tmp/system/qrCodes.png`, qrCodesLocation);
    abFS.rmdirRecursiveSync('./tmp');

}
module.exports.createQRCodes_Async = createQRCodes_Async;


async function createQRCodeImage_Async(index, link) {
    return new Promise((resolve, reject) => {
        qrcode.toFile(`./tmp/system/qrCodes/${index}.png`, [{ data: link, }], {
            scale: qrScale,
            color: {
                dark: '#000',
                light: '#FFFF'
            },
        }, (err) => {
            if (err) {
                reject(err)
                return;
            }

            resolve();
        });
    });
}


function addQRCodeOverlays_Async(clipInfos) {
    let composites = [];

    /* QR Codes */
    for (let i = 0; i < clipInfos.length; i++) {
        composites.push({
            input: `./tmp/system/qrCodes/${i}.png`,
            top: yTop + yOffset * i,
            left: 120,
        });
    }

    /* Names */
    for (let i = 0; i < clipInfos.length; i++) {
        composites.push({
            input: Buffer.from(textToSVG.getSVG(clipInfos[i].name, {
                x: 0, 
                y: 0, 
                fontSize: namesFontSize, 
                anchor: 'top',
                attributes: {
                    fill: 'black',
                    stroke: 'black',
                },
            })),
            top: yTop + textYOffset + yOffset * i,
            left: textXOffset,
        });
    }

    return sharp(`./tmp/system/qrCodes.png`)
        .composite(composites)
        .png()
        .toFile(`./tmp/system/qrCodes.png.tmp`)
        .then(() => {
            fs.copyFileSync(`./tmp/system/qrCodes.png.tmp`, `./tmp/system/qrCodes.png`);
        })
        .then(() => {
            fs.unlinkSync('./tmp/system/qrCodes.png.tmp');
        })
        .catch((err) => {
            console.log('Error when overlaying.', err.stack);
        });
}


function getUrl(clipInfos, ytLink, index) {
    let time = 0;
    for (let i = 0; i < index; i++)
        time += clipInfos[i].duration;

    return `${ytLink}?t=` + Math.floor(time);
}   