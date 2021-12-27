jsLibs.exportModule('ab-nodes', 'HtmlElement', (require, module, exports) => { 'use strict';

const
    abNodes = require('.')
;


class HtmlElement
{

    static AddChild(parentHtmlElement, htmlElement, nextHtmlElement = null)
    {
        try {
            if (nextHtmlElement === null)
                parentHtmlElement.appendChild(htmlElement);
            else
                parentHtmlElement.insertBefore(htmlElement, nextHtmlElement);
        } catch (e) {
            if (abNodes.debug)
                console.warn(e);
        }
    }

    static ClearChildren(htmlElement)
    {
        while (htmlElement.firstChild)
            htmlElement.removeChild(htmlElement.firstChild);
    }

    static RemoveChild(parentHtmlElement, htmlElement)
    {
        try {
            parentHtmlElement.removeChild(htmlElement);
        } catch (e) {
            if (abNodes.debug)
                console.warn(e);
        }
    }

}

module.exports = HtmlElement;






 });