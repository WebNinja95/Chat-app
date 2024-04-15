import {JSDOM} from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);
// const clean = purify.sanitize('<b>hello there</b>');
export default purify