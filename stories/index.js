/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import { storiesOf } from '@storybook/react';
import BarebonesExample from './barebones';

import './generic.css';

import { handleClick, SANDBOX_URL } from './sandbox-utils';

const wrapWithSource = (node, src) => (
  <div>
    {node}

    <br />
    <form id="codesandbox-form" action={SANDBOX_URL} method="POST">
      <input id="codesandbox-parameters" type="hidden" name="parameters" />
    </form>
    <button type="button" className="sandboxButton" onClick={handleClick(src)}>
      PLAY WITH THIS CODE →
    </button>
    <a
      href={`https://github.com/fritz-c/react-shape-editor/blob/master/stories/${src}`}
      target="_top"
      rel="noopener noreferrer"
      className="sourceLink"
    >
      VIEW SOURCE →
    </a>
  </div>
);

storiesOf('Basics', module).add('Minimal implementation', () =>
  wrapWithSource(<BarebonesExample />, 'barebones.js')
);
