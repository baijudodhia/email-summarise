"use strict";

var stopwords = require('./stopwords');
var sws;
var tp = require('./textpreprocessing');
var email_subject;
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
var max_frequency_words_sentence;
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
            email_subject = gmail.get.email_subject(domEmail);
            console.log(email_subject);
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

        console.log("HERE - " + text);
        arr_sentences = [];
        arr_sentences_removedStopwords = [];
        stemmed_array_sentences = [];
        stemmed_array_sentences_removedStopwords = [];
        words_count = [];
        max_count_of_any_word = 0;
        max_frequency_words = [];
        imp_index = [];
        extracted_Emails = tp.ExtractEmails(text);
        extracted_Links = tp.ExtractLinks(text);
        text = tp.RemoveWordBreakingOpportunityTag(text);
        text = tp.RemoveHtmlTags(text);
        text = email_subject + ". " + text;
        // console.log(text.split(/(?<=\S\S\S[\.?!])\s+/));
        text = tp.RemoveSpecialCharactersCode(text);
        text = tp.RemoveNonASCIICharacters(text);
        text = tp.RemoveHyphenFromPhoneNumbers(text);
        text = tp.RemoveWhiteSpaceFromPhoneNumbers(text);
        extracted_Phones = tp.ExtractPhones(text);
        text = tp.RemoveListBulletin(text);
        text = tp.RemoveStatisticalData(text);
        text = tp.RemoveNewLine(text);
        text = tp.RemoveWhiteSpaces(text);
        text = tp.RemoveSentenceStartWhiteSpace(text);
        text = tp.RemoveWhiteSpacesWithoutAfterSpace(text);
        text = tp.RemoveWhiteSpacesWithBlank(text);
        text = tp.RemoveBracketInformation(text);
        text = tp.RemoveWhiteSpaceAroundFullStop(text);
        text = tp.RemoveWhiteSpaceAroundQuestionMark(text);
        text = tp.RemoveWhiteSpaceAroundExclamationMark(text);
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
        let arr_sentences2 = text.replace(/(?<=[\w]+)[\.](?=[\w]+)/gm, ""); //Replaces Dot with blank whenever it is in between two words without spaces
        arr_sentences2 = text.split(/(?<=\S\S\S[\.?!])\s+/gm);
        length = arr_sentences2.length;
        let c = 0;
        for (let i = 0; i < length; i++) {
            if (arr_sentences2[i].length > 10) {
                arr_sentences[c] = arr_sentences2[i];
                c++;
            }
        }
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
                // var re = new RegExp(stemmed_word, 'g');
                var re = "/" + stemmed_word + "/gm";
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
                if (word) {
                    if (count === 10) {
                        break;
                    }
                    if (words_count[word] === i) {
                        max_frequency_words[count] = word;
                        count++;
                    }
                }
            }
        }
        for (var i = 0; i < 10; i++) {
            console.log(i + " - " + max_frequency_words[i]);
        }
    }

    function wordCountMap(str) {
        let words = str.split(' ');
        let wordCount = {};
        words.forEach((w) => {
            wordCount[w] = (wordCount[w] || 0) + 1;

        });
        return wordCount;
    }

    function wordMapToVector(map, dict) {
        let wordCountVector = [];
        for (let term in dict) {
            wordCountVector.push(map[term] || 0);
        }
        return wordCountVector;
    }

    function addWordsToDictionary(wordCountmap, dict) {
        for (let key in wordCountmap) {
            dict[key] = true;
        }
    }

    function dotProduct(vecA, vecB) {
        let product = 0;
        for (let i = 0; i < vecA.length; i++) {
            product += vecA[i] * vecB[i];
        }
        return product;
    }

    function magnitude(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    function cosineSimilarity(vecA, vecB) {
        return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
    }

    function textCosineSimilarity(txtA, txtB) {
        const wordCountA = wordCountMap(txtA);
        const wordCountB = wordCountMap(txtB);
        let dict = {};
        addWordsToDictionary(wordCountA, dict);
        addWordsToDictionary(wordCountB, dict);
        const vectorA = wordMapToVector(wordCountA, dict);
        const vectorB = wordMapToVector(wordCountB, dict);
        return cosineSimilarity(vectorA, vectorB);
    }

    function ImportantSentences() {
        var max_frequency_words_length = max_frequency_words.length;
        max_frequency_words_sentence = "";
        for (let i = 0; i < max_frequency_words_length; i++) {
            max_frequency_words_sentence += max_frequency_words[i] + " ";
        }
        max_count = [];
        var stemmed_array_sentences_removedStopwords_length = stemmed_array_sentences_removedStopwords.length;
        for (let i = 0; i < stemmed_array_sentences_removedStopwords_length; i++) {
            max_count[i] = textCosineSimilarity(stemmed_array_sentences_removedStopwords[i], max_frequency_words_sentence);
        }
        FindLargest();
    }

    // function ImportantSentences() {
    //     var max_frequency_words_length = max_frequency_words.length;
    //     max_count = [];
    //     var stemmed_array_sentences_removedStopwords_length = stemmed_array_sentences_removedStopwords.length;
    //     for (var i = 0; i < stemmed_array_sentences_removedStopwords_length; i++) {
    //         for (var j = 0; j < max_frequency_words_length; j++) {
    //             var patt = new RegExp(max_frequency_words[j], "g");
    //             var res = patt.test(stemmed_array_sentences_removedStopwords[i]);
    //             if (res) {
    //                 if (max_count[i] === undefined) {
    //                     max_count[i] = 1;
    //                 } else {
    //                     max_count[i] += 1;
    //                 }
    //             }
    //         }
    //     }
    //     FindLargest();
    // }



    function FindLargest() {
        console.log(arr_sentences);
        imp_index = [];
        var sorted_max_count = [];
        sorted_max_count = Array.from(max_count);
        sorted_max_count.sort(function (a, b) { return b - a });
        // var unique_sorted_max_count = Array.from(new Set(sorted_max_count));
        var length_max_count = max_count.length;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < length_max_count; j++) {
                if (sorted_max_count[i] === max_count[j]) {
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
            text += (i + 1) + ". " + arr_sentences[imp_index[i]];
            text += "<br />";
        }
        if (extracted_Emails !== null) {
            text += "<br />Emails Extracted - <br />";
            for (var i = 0; i < extracted_Emails.length; i++) {
                text += (i + 1);
                text += ". ";
                text += "<a target='_blank' href='mailto:" + extracted_Emails[i] + "'>" + extracted_Emails[i] + "</a>";
                text += "<br />";
            }
        }
        if (extracted_Links !== null) {
            text += "<br />Links Extracted - <br />";
            for (var i = 0; i < extracted_Links.length; i++) {
                text += (i + 1);
                text += ". ";
                text += "<a target='_blank' href='" + extracted_Links[i] + "'>" + extracted_Links[i] + "</a>";
                text += "<br />";
            }
        }
        if (extracted_Phones !== null) {
            text += "<br />Phone Numbers Extracted - <br />";
            for (var i = 0; i < extracted_Phones.length; i++) {
                text += (i + 1);
                text += ". ";
                text += "<a target='_blank' href='tel:" + extracted_Phones[i] + "'>" + extracted_Phones[i] + "</a>";
                text += "<br />";
            }
        }
        return text;
    }
}