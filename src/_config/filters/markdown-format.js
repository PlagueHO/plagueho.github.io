// by Chris Burnell: https://chrisburnell.com/article/some-eleventy-filters/#markdown-format

import {markdownLib} from '../plugins/markdown.js';

export const markdownFormat = string => markdownLib.render(string);
