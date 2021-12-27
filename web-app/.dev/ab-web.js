'use strict';

const
    abWeb = require('ab-web')
;


module.exports = abWeb.config()
    .init('ab-bootstrap')
    .init('ab-cookies')
    .init('ab-date')
    .init('ab-native')
    .init('ab-pager')
    .init('ab-resource-preloader')
    .init('ab-text')
    .init('ab-time')
    .init('ab-timer')
    .init('font-awesome')
    .init('js0')
    .init('jquery')
    .init('sortablejs')
    .init('spk-messages')
    .init('spocky')
    .init('web-ab-api')
    .ext((conf, data) => {
        conf
            .extArr(data['replace']['files'], [
                [ '../../electron/index.base.html', '../../electron/index.html' ],
            ])
            .extArr(data['sass']['paths'], [
                '../core/scss',
            ])
            .extArr(data['spocky']['packages'], [
                '../core',         
            ])
            .extArr(data['js']['include'], [
                conf.buildInfo.type('rel') ? 
                    '../js/BuildType.rel.js' : '../js/BuildType.dev.js',
            ]);
    });

// module.exports = {
//     'sass': {
//         paths: [
//             /* Datetime Picker */
//             '../dev/node_modules/ab-bootstrap-datetimepicker/src/sass/bootstrap-datetimepicker-build.scss',
//         ],
//     },

//     'js': {
//         include: [
//            /* Datetime Picker */
//            '../dev/node_modules/ab-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
//         ],
//         paths: [
//         ],
//     },
// };