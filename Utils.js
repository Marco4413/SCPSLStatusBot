/**
 * Formats the specified String with the specified Formats
 * 
 * Function stolen from: https://github.com/Marco4413/JackBot/blob/latest/Utils.js
 * @param {String} str The String to Format
 * @param {...Any} formats The Formats to format the String with
 * @returns {String} The formatted String
 */
const FormatString = (str, ...formats) => {
    if (formats.length === 0) return str;
    return str.replace(/{(\d+)}/g, (match, number) => {
        const index = Number.parseInt(number);
        return index < formats.length ? formats[index] : match;
    });
};

module.exports = { FormatString };
