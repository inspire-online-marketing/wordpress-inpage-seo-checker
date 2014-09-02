// Neither written in OO nor in FP 
// Be kind when reading the code, 
// I'm no JS hacker. Thank you. 
;
(function() {

    function getText(node) {
        if (node.nodeType === 3) {
            return node.data;
        }
        var text = '';
        if (node = node.firstChild) do {
            text += getText(node);
        } while (node = node.nextSibling);
        return text;
    }

    function getElementContent(tag) {
        var tags = getElementsByTagName(tag);
        var content;
        if (tags.length > 0) {
            content = getText(tags[0]);
        }
        return content;
    }

    function getMeta(name) {
        var metas = getElementsByAttribute('meta', 'name', name);
        var content;
        if (metas.length > 0) {
            content = metas[0].getAttribute('content');
        }
        return content;
    }

    // Better minimized

    function element(el) {
        return document.createElement(el);
    }

    // Better minimized

    function getElementsByTagName(tagName) {
        return document.getElementsByTagName(tagName);
    }

    function findTagsWithEmptyAttribute(tagName, attributeName) {
        var elements = getElementsByTagName(tagName);
        var result = new Array();
        var current;
        var attribute;
        for (var i = 0; i < elements.length; i++) {
            current = elements[i];
            attribute = current.getAttribute && current.getAttribute(attributeName);
            if (attribute == null || attribute.length == 0 || typeof attribute == "undefined") {
                result.push(current);
            }
        }
        return result;
    }

    function getElementsByAttribute(tagName, attributeName, attributeValue) {
        var elements = getElementsByTagName(tagName);
        var result = new Array();
        var value = (typeof attributeName != "undefined") ? new RegExp("(^|\\s)" + attributeValue + "(\\s|$)", "i") : null;
        var current;
        var attribute;
        for (var i = 0; i < elements.length; i++) {
            current = elements[i];
            attribute = current.getAttribute && current.getAttribute(attributeName);
            if (typeof attribute == "string" && attribute.length > 0) {
                if (typeof attributeValue == "undefined" || (value && value.test(attribute))) {
                    result.push(current);
                }
            }
        }
        return result;
    }

    function elementWithContent(tag, content) {
        var el = element(tag);
        el.innerHTML = content;
        return el;
    }

    function addError(element, error) {
        var li = elementWithContent('li', error);
        element.appendChild(li);
    }

    function exists(variable) {
        if (typeof variable === 'undefined') {
            return false;
        } else {
            return true;
        }
    }

    // conf(config, 'check.value1.value2,value3', 3);
    // better than flat a_b_c values?

    function conf(value, elseValue) {
        if (exists(value)) {
            return value;
        } else return elseValue;
    }

    function checkTagMin(errors, tag, min) {
        var tags = getElementsByTagName(tag).length;
        if (tags < min) {
            errors.push('Page has less than ' + min + ' ' + tag);
        }
        return errors;
    }

    function checkTagMax(errors, tag, max) {
        var tags = getElementsByTagName(tag).length;
        if (tags > max) {
            errors.push('Page has more than ' + max + ' ' + tag);
        }
        return errors;
    }

    function checkTagMinMax(errors, tag, min, max) {
        errors = checkTagMin(errors, tag, min);
        errors = checkTagMax(errors, tag, max);
        return errors;
    }

    function on(config) {
        return (exists(config) && config == true) || (!exists(config));
    }

    function checkSeo(config) {
        var errors = new Array();
        // Perhaps introduction of a Check class, with MinMaxCheck etc.
        // Check H1-H3
        if (on(config.h_check)) {
            errors = checkTagMinMax(errors, 'H1', conf(config.h1_min, 1), conf(config.h1_max, 1));
            errors = checkTagMin(errors, 'H2', conf(config.h2_min, 1));
            errors = checkTagMin(errors, 'H3', conf(config.h3_min, 1));
        }
        // Check for <strong> tags 
        if (on(config.strong_check)) {
            var strongs = getElementsByTagName('strong');
            var bs = getElementsByTagName('b');
            if (strongs.length + bs.length == 0) {
                errors.push("Page has no STRONG/B.");
            }
        }
        // Check for <em> tags 
        if (on(config.em_check)) {
            var ems = getElementsByTagName('em');
            var is = getElementsByTagName('i');
            if (ems.length + is.length == 0) {
                errors.push("Page has no EM/I.");
            }
        }
        // Check for <img> without alt or empty alt
        if (on(config.img_check)) {
            var imgWithoutAlt = findTagsWithEmptyAttribute('img', 'alt');
            if (imgWithoutAlt.length > 0) {
                errors.push(imgWithoutAlt.length + ' IMGs have no or empty alt.');
            }
        }
        // Check number of keywords
        if (on(config.keywords_check)) {
            var keywords = getMeta("keywords");
            if (!exists(keywords)) {
                errors.push('Page should have META keywords.');
            } else {
                var keyWordCount = keywords.split(",").length;
                var min = conf(config.keywords_min, 1);
                var max = conf(config.keywords_max, 5);
                if (keyWordCount > max) {
                    errors.push('Page has more than ' + min + ' META keywords.');
                }
                if (keyWordCount < conf(config.keywords_min, 1)) {
                    errors.push('Page has less than ' + min+ ' META keywords.');
                }
            }
        }
        // Check for META description and correct size
        if (on(config.description_check)) {
            var description = getMeta('description');
            var min = conf(config.description_min, 70);
            var max = conf(config.description_max, 160);
            if (!exists(description)) {
                errors.push('Page should have a META description.');
            } else if (description.length < min || description.length > max) {
                errors.push("META description should be between " + min + " and " + max + " characters.");
            }
        }
        // Check if title has correct size
        if (on(config.title_check)) {
            var title = getElementContent('title');
            var min = conf(config.title_min, 10);
            var max = conf(config.title_max, 70);
            if (!exists(title)) {
                errors.push('Page should have a title.');
            } else if (title.length < min || title.length > max) {
                errors.push('Title should be between ' + min + ' and ' + max + ' characters.');
            }
        }
        // Print errors
        if (errors.length > 0) {
            var div = element('div');
            div.setAttribute("style", "background-color:#ffaaaa;position:fixed;right:0px;bottom:0px;z-index:9999;padding:10px;");
            div.appendChild(elementWithContent('div', '<b>InPage SEO Checker: ' + errors.length + ' error(s)</b>'));
            var out = element('ul');
            for (var i = 0; i < errors.length; i++) {
                addError(out, errors[i]);
            }
            div.appendChild(out);
            var body = getElementsByTagName('body')[0];
            body.insertBefore(div, body.firstChild);
        }
    }
    var seoConfig = {};
    for (var c in window._seo) {
        if (!_seo.hasOwnProperty(c)) {
            continue;
        }
        seoConfig[c] = _seo[c];
    }

    checkSeo(seoConfig);
})();