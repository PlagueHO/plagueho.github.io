import assert from 'node:assert/strict';
import {test} from 'node:test';
import nunjucks from 'nunjucks';
import {tagTone} from '../src/_config/filters/tag-tone.js';

const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader('src/_includes'));
environment.addFilter('tagTone', tagTone);

test('tags with a generated page retain their navigation link', () => {
  const html = environment.render('partials/tag-badge.njk', {
    tag: 'azure',
    collections: {tagList: ['azure']}
  });

  assert.match(html, /<a[^>]+href="\/tags\/azure\/"[^>]*>azure<\/a>/);
  assert.doesNotMatch(html, /<span/);
});

test('tags without a generated page remain visible without a broken link', () => {
  const html = environment.render('partials/tag-badge.njk', {
    tag: 'powershell',
    collections: {tagList: ['azure']}
  });

  assert.match(html, /<span[^>]+data-small-button-tag[^>]*>powershell<\/span>/);
  assert.doesNotMatch(html, /<a/);
});
