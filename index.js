#!/usr/bin/env node

// params: email, subject

const config = require('home-config').load('.bellrc');
const argv = require('yargs').argv;

const noConfig = () => !Object.keys(config.getAll()).length;
const init     = argv._[0]
const { mailgunKey, mailgunDomain, email, subject } = argv

const defaultParamsMessage = `

Please run this command below:
bell init --mailgun-key=<mailgun_key> --mailgun-domain=<mailgun_domain> --email=<email_address> --subject=<optional_subject>
`

if (init) {
  config.section = Object.assign({},
    mailgunKey ? { mailgunKey } : {},
    mailgunDomain ? { mailgunDomain } : {},
    email ? { email } : {},
    subject ? { subject: subject || 'Bell' } : {}
  )

  if (!Object.keys(config.section).length) {
    console.log('Params cannot be empty.', defaultParamsMessage)
  }
  else {
    config.save()
    console.log('Configuration has been saved.')
  }

  return
}

if (noConfig()) {
  console.log('No configuration found.', defaultParamsMessage)
  return
}

const data = {
  from:    'Bell <hi@signalvip.com>',
  to:      config.section.email,
  text:    argv._[0] || 'Bell!',
  subject: subject || 'Bell'
};

const mailgun = require('mailgun-js')({
  apiKey: config.section.mailgunKey,
  domain: config.section.mailgunDomain,
});

mailgun.messages().send(data, (error, body) => {
  console.log(body);
});