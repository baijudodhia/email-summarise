exports.RemoveHtmlTags = function (text) {
    var removed_HtmlTags = text.replace(/<[^>]*>/gm, ' ');
    return removed_HtmlTags;
}

exports.RemoveSpecialCharactersCode = function (text) {
    var removed_SpecialCharactersCode = text.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/gm, ' ');
    return removed_SpecialCharactersCode;
}

exports.RemoveNewLine = function (text) {
    var removed_NewLine = text.replace(/\n+/gm, '\n');
    return removed_NewLine;
}

exports.RemoveWhiteSpaces = function (text) {
    var removed_WhiteSpaces = text.replace(/\s+/gm, ' ');
    return removed_WhiteSpaces;
}

exports.RemoveWhiteSpacesWithoutAfterSpace = function (text) {
    var replaceToSpaceWithoutAfterSpace = text.replace(/[-|'|"|(|)|/|<|>|,|:|;](?! )/gm, " ");
    return replaceToSpaceWithoutAfterSpace;
}

exports.RemoveWhiteSpacesWithBlank = function (text) {
    var replaceToBlankWithCharacters = text.replace(/[-|'|"|(|)|/|<|>|,|:|;]/gm, "");
    return replaceToBlankWithCharacters;
}

exports.RemoveLeadingSpaces = function (arr_scentences) {
    arr_length = arr_scentences;
    for (let j = 0; j < arr_length.length; j++) {
        arr_scentences[j] = arr_scentences[j].replace(/[ ]+(?! )[\.]/gm, ". ");
    }
    return arr_scentences;
}

exports.RemoveStopwords = function (text, sws) {
    length_text = text.length;
    length_sws = sws.length;
    for (let j = 0; j < length_text; j++) {
        for (let i = 0; i < length_sws; i++) {
            var re = new RegExp(sws[i], "gi");
            text[j] = text[j].replace(re, ' ');
        }
    }
    return text;
}

exports.RemoveBracketInformation = function (text) {
    text = text.replace(/(\(.*\)|(\s\(.*\)))/gm, ' ');
    return text;
}

exports.RemoveStatisticalData = function (text) {
    text = text.replace(/[\w{1,}\.?]+\@\w{1,}\.?\w{1,}\.?\w{1,}/gm, '');
    text = text.replace(/(http\S*[\/][?=\s]\S*)|(http\S*[^\s])/gm, '');
    text = text.replace(/\+?\d[\d -]{8,12}\d/gm, '');
    return text;
}

exports.ExtractEmails = function (text) {
    var extracted_Emails = text.match(/[\w{1,}\-\.?]+\@\w{1,}\.?\w{1,}\.?\w{1,}/gm);
    return extracted_Emails;
}

exports.ExtractLinks = function (text) {
    var extracted_Links = text.match(/(http\S*[\/][?=\s]\S*)|(http\S*[^\s])/gm);
    return extracted_Links;
}

exports.ExtractPhones = function (text) {
    var extracted_Phones = text.match(/\+?\d[\d -]{8,12}\d/gm);
    return extracted_Phones;
}