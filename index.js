#!/usr/bin/env node

'use strict';

const homeConfig = require('home-config');
const inquirer   = require('inquirer');

const config    = homeConfig.load('.bellrc');
const noConfig  = !Object.keys(config.getAll()).length;
const firstArgs = process.argv[2];
const init      = (firstArgs === 'init');

function _required (value) {
  if (value) return true;

  return 'Field is required';
}

const questionsForInitConfig = [
  { name: 'mailgunKey',
    type: 'input',
    message: 'Mailgun API Key',
    validate: _required,
  },
  { name: 'mailgunDomain',
    type: 'input',
    message: 'Your custom Mailgun domain',
    validate: _required,
  },
  { name: 'email',
    type: 'input',
    message: 'Default recipient email',
    validate: _required,
  },
  { name: 'subject',
    type: 'input',
    message: 'Default email subject',
    default: 'Bell',
  },
  { name: 'text',
    type: 'input',
    message: 'Default text of email',
    default: 'Bell for you',
  },
];

function initConfig () {
  inquirer.prompt(questionsForInitConfig).then(answers => {
    Object.keys(answers).forEach(param => {
      config[param] = answers[param]
    });

    config.save();
    console.log('Configuration has been saved.');
  })
  .catch(err => {
    console.log('Error on init configuration.\n', err);
  });
}

if (init) {
  initConfig();
  return;
}

if (noConfig) {
  console.log('Please init configuration below.\n');
  initConfig();
  return;
}

const data = {
  from:    'Bell <hi@signalvip.com>',
  to:      config.email,
  text:    firstArgs || config.text,
  subject: config.subject,
};

const mailgun = require('mailgun-js')({
  apiKey: config.mailgunKey,
  domain: config.mailgunDomain,
});

mailgun.messages().send(data, (error, body) => {
  if (error) {
    console.log('[OH NO] Something is wrong.', error);
  }
  else {
    console.log('[OK] You should get a bell!');
  }
});
