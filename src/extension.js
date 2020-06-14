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
        console.log(tp.ExtractLinks(text));
        text = tp.RemoveHtmlTags(text);
        text = tp.RemoveSpecialCharactersCode(text);
        console.log(tp.ExtractEmails(text));
        console.log(tp.ExtractPhones(text));
        text = tp.RemoveStatisticalData(text);
        text = tp.RemoveNewLine(text);
        text = tp.RemoveWhiteSpaces(text);
        text = tp.RemoveStopwords(text, sws);
        return text;
    }
}