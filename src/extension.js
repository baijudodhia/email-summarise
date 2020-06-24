"use strict";

var stopwords = require('./stopwords');
var sws;
var tp = require('./textpreprocessing');
var removed_HtmlTags;
var removed_SpecialCharactersCode;
var removed_NewLine;
var removed_WhiteSpaces;
var removed_Stopwords;
var extracted_Emails, removed_Emails;
var extracted_Phones, removed_Phones;
var extracted_Links, removed_Links;
var stemmer = require('stemmer');
var arr_sentences;
var temp_arr_sentences;
var arr_sentences_removedStopwords;
var stemmed_array_sentences;
var stemmed_array_sentences_removedStopwords;
var words_count;
var max_count_of_any_word;
var max_frequency_words;
var max_count;
var imp_index;

//Gloabl variable to handle emailData since local variables lead to creation of nested  (view_email => (add_button)) which add a new button on toolbar everytime on opening a email and didn't remove the previous one. 
var emailData;

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// actual extension-code
function startExtension(gmail) {

    sws = stopwords.stopwords();

    console.log("Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");

        //Works without opening the mail
        //IMP - Only counts number of selected emails, can't acces the body content of email without opening it!
        gmail.tools.add_toolbar_button("Count", (domEmail) => {
            var checkedLength = gmail.get.selected_emails_data().length;
            if (checkedLength == 0) {
                alert("Select atleast one email!");
            }
            else if (checkedLength > 0) {
                if (checkedLength > 1) {
                    alert("Selected " + checkedLength + " emails!");
                } else {
                    alert("Selected " + checkedLength + " email!");
                }
            }
        });

        //Works on opening the mail
        //IMP - Can only check the one opened email, not more than one!
        gmail.observe.on("view_email", (domEmail) => {
            //Don't add button here else will lead to creation of multiple buttons.
            emailData = gmail.new.get.email_data(domEmail);
        });

        //Keep already added button in toolbar since adding inside gmail.observe.on("view_email") lead to addition of mutliple buttons without removing the previous ones.
        gmail.tools.add_toolbar_button("Summarise", () => {
            summarise(emailData);
        });

    });

    function summarise(emailData) {
        if (Object.keys(emailData).length === 0) {
            alert("Please open an email to summarise!");
        }
        else {
            var EmailBody = TextPreprocessing(emailData.content_html);
            gmail.tools.add_modal_window('Email Body', EmailBody,
                function () {
                    gmail.tools.remove_modal_window();
                });
        }
    }

    function TextPreprocessing(text) {

        arr_sentences = [];
        arr_sentences_removedStopwords = [];
        stemmed_array_sentences = [];
        stemmed_array_sentences_removedStopwords = [];
        words_count = [];
        max_count_of_any_word = 0;
        max_frequency_words = [];
        imp_index = [];
        text = tp.RemoveHtmlTags(text);
        text = tp.RemoveSpecialCharactersCode(text);
        extracted_Emails = tp.ExtractEmails(text);
        extracted_Links = tp.ExtractLinks(text);
        extracted_Phones = tp.ExtractPhones(text);
        text = tp.RemoveStatisticalData(text);
        text = tp.RemoveNewLine(text);
        text = tp.RemoveWhiteSpaces(text);

        text = tp.RemoveWhiteSpacesWithoutAfterSpace(text);
        text = tp.RemoveWhiteSpacesWithBlank(text);
        text = tp.RemoveBracketInformation(text);
        arr_sentences = SplitToSentences(text);
        temp_arr_sentences = Array.from(arr_sentences);
        arr_sentences = tp.RemoveLeadingSpaces(temp_arr_sentences);
        temp_arr_sentences = []

        temp_arr_sentences = Array.from(arr_sentences);
        stemmed_array_sentences = StemmedSentences(temp_arr_sentences);
        arr_sentences_removedStopwords = tp.RemoveStopwords(temp_arr_sentences, sws);
        stemmed_array_sentences_removedStopwords = tp.RemoveStopwords(stemmed_array_sentences, sws);
        WordFrequencyCounter(stemmed_array_sentences_removedStopwords);
        MaxFrequencyWords();
        ImportantSentences();
        text = GenerateSummary(text);
        return text;
    }

    function SplitToSentences(text) {
        arr_sentences = text.replace(/(?<=[\w]+)[\.](?=[\w]+)/gm, ""); //Replaces Dot with blank whenever it is in between two words without spaces
        arr_sentences = text.split(". ");
        return arr_sentences;
    }

    function StemmedSentences(sentences) {
        var sentence_length = sentences.length;
        for (let i = 0; i < sentence_length; i++) {
            var words_in_sentence = sentences[i].split(' ');
            var word_length = words_in_sentence.length;
            stemmed_array_sentences[i] = sentences[i];
            for (let j = 0; j < word_length; j++) {
                let stemmed_word = stemmer(words_in_sentence[j]);
                var re = new RegExp(stemmed_word, 'g');
                stemmed_array_sentences[i] = stemmed_array_sentences[i].replace(re, stemmed_word);
            }
        }
        return stemmed_array_sentences;
    }

    function WordFrequencyCounter(sentences) {
        var sentence_length = sentences.length;
        for (let i = 0; i < sentence_length; i++) {
            var words_in_sentence = sentences[i].split(' ');
            var word_length = words_in_sentence.length;
            for (let j = 0; j < word_length; j++) {
                let stemmed_word = stemmer(words_in_sentence[j]);
                if (words_count[stemmed_word] === undefined) {
                    words_count[stemmed_word] = 1;
                } else {
                    words_count[stemmed_word] += 1;
                }
                if (max_count_of_any_word < words_count[stemmed_word]) {
                    max_count_of_any_word = words_count[stemmed_word];
                }
            }
        }
    }

    function MaxFrequencyWords() {
        var count = 0;
        for (var i = max_count_of_any_word; i > 0; i--) {
            for (var word in words_count) {
                if (count === 5) {
                    break;
                }
                if (words_count[word] === i) {
                    max_frequency_words[count] = word;
                    count++;
                }
            }
        }
        for (var i = 0; i < 5; i++) {
            console.log(i + " - " + max_frequency_words[i]);
        }
    }

    function ImportantSentences() {
        var max_frequency_words_length = max_frequency_words.length;
        max_count = [];
        var stemmed_array_sentences_removedStopwords_length = stemmed_array_sentences_removedStopwords.length;
        for (var i = 0; i < stemmed_array_sentences_removedStopwords_length; i++) {
            for (var j = 0; j < max_frequency_words_length; j++) {
                var patt = new RegExp(max_frequency_words[j], "g");
                var res = patt.test(stemmed_array_sentences_removedStopwords[i]);
                if (res) {
                    if (max_count[i] === undefined) {
                        max_count[i] = 1;
                    } else {
                        max_count[i] += 1;
                    }
                }
            }
        }
        FindLargest();
    }

    function FindLargest() {
        imp_index = [];
        var sorted_max_count = [];
        sorted_max_count = Array.from(max_count);
        sorted_max_count.sort(function (a, b) { return b - a });
        var unique_sorted_max_count = Array.from(new Set(sorted_max_count));
        var length_max_count = max_count.length;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < length_max_count; j++) {
                if (unique_sorted_max_count[i] === max_count[j]) {
                    imp_index[i] = j;
                    break;
                }
            }
        }
        imp_index.sort(function (a, b) { return a - b });
    }

    function GenerateSummary(text) {
        text = "";
        for (var i = 0; i < 3; i++) {
            text += arr_sentences[imp_index[i]];
            text += ".<br />";
        }
        text += "<br />Emails Extracted - <br />";
        if (extracted_Emails !== null) {
            for (var i = 0; i < extracted_Emails.length; i++) {
                text += (i + 1);
                text += ". ";
                text += extracted_Emails[i];
                text += "<br />";
            }
        }
        if (extracted_Links !== null) {
            text += "<br />Links Extracted - <br />";
            for (var i = 0; i < extracted_Links.length; i++) {
                text += (i + 1);
                text += ". ";
                text += extracted_Links[i];
                text += "<br />";
            }
        }
        if (extracted_Phones !== null) {
            text += "<br />Phone Numbers Extracted - <br />";
            for (var i = 0; i < extracted_Phones.length; i++) {
                text += extracted_Phones[i];
                text += ", ";
            }
        }
        return text;
    }
}