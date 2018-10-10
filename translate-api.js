const translate = require('google-translate-api');

exports.googleTranslate = async(opts) => {
    console.log("Translated text :", opts);
    return translate(opts.text, { to: opts.lang ,  agents: [
        'Mozilla/5.0 (Windows NT 10.0; ...',
        'Mozilla/4.0 (Windows NT 10.0; ...',
        'Mozilla/5.0 (Windows NT 10.0; ...'
    ],
    proxies: [
        'LOGIN:PASSWORD@192.0.2.100:12345',
        'LOGIN:PASSWORD@192.0.2.200:54321'
    ]}).then(res => {
        console.log(res.text);
        //=> I speak English
        console.log(res.from.language.iso);
        return res.text;
        //=> nl
    }).catch(err => {
        console.error(err);
    });
}

