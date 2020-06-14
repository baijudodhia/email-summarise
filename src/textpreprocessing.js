exports.RemoveHtmlTags = function (text) {
    var removed_HtmlTags = text.replace(/<[^>]*>/g, ' ');
    return removed_HtmlTags;
}

exports.RemoveSpecialCharactersCode = function (text) {
    var removed_SpecialCharactersCode = text.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/g, ' ');
    return removed_SpecialCharactersCode;
}

exports.RemoveNewLine = function (text) {
    var removed_NewLine = text.replace(/\n+/g, ' ');
    return removed_NewLine;
}

exports.RemoveWhiteSpaces = function (text) {
    var removed_WhiteSpaces = text.replace(/\s+/g, ' ');
    return removed_WhiteSpaces;
}