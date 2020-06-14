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
exports.RemoveStatisticalData = function (text) {
    text = text.replace(/[\w{1,}\.?]+\@\w{1,}\.?\w{1,}\.?\w{1,}/g, '');
    text = text.replace(/(http\S*[\/][?=\s]\S*)|(http\S*[^\s])/g, '');
    text = text.replace(/\+?\d[\d -]{8,12}\d/g, '');
    return text;
}

exports.ExtractEmails = function (text) {
    var extracted_Emails = text.match(/[\w{1,}\-\.?]+\@\w{1,}\.?\w{1,}\.?\w{1,}/g);
    return extracted_Emails;
}

exports.ExtractLinks = function (text) {
    var extracted_Links = text.match(/(http\S*[\/][?=\s]\S*)|(http\S*[^\s])/g);
    return extracted_Links;
}

exports.ExtractPhones = function (text) {
    var extracted_Phones = text.match(/\+?\d[\d -]{8,12}\d/g);
    return extracted_Phones;
}

exports.RemoveStopwords = function (text, sws) {
    length_sws = sws.length;
    for (let i = 0; i < length_sws; i++) {
        var re = new RegExp(sws[i], "gi");
        text = text.replace(re, ' ');
    }
    return text;
}