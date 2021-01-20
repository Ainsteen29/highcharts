/* *
 *
 *  Data Layer
 *
 *  (c) 2012-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
/* *
 *
 *  Imports
 *
 * */
import DataTable from './DataTable.js';
import U from './../Core/Utilities.js';
var merge = U.merge, isNumber = U.isNumber;
/* *
 *
 *  Class
 *
 * */
/**
 * Class to convert between common value types.
 */
var DataConverter = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    /**
     * Constructs an instance of the Data Converter.
     *
     * @param {DataConverter.Options} [options]
     * Options for the Data Converter.
     *
     * @param {DataConverter.ParseDateCallbackFunction} [parseDate]
     * A function to parse string representations of dates
     * into JavaScript timestamps.
     */
    function DataConverter(options, parseDate) {
        /**
         * A collection of available date formats.
         *
         * @name Highcharts.Data#dateFormats
         * @type {Highcharts.Dictionary<Highcharts.DataDateFormatObject>}
         */
        this.dateFormats = {
            'YYYY/mm/dd': {
                regex: /^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,
                parser: function (match) {
                    return (match ?
                        Date.UTC(+match[1], match[2] - 1, +match[3]) :
                        NaN);
                }
            },
            'dd/mm/YYYY': {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                parser: function (match) {
                    return (match ?
                        Date.UTC(+match[3], match[2] - 1, +match[1]) :
                        NaN);
                },
                alternative: 'mm/dd/YYYY' // different format with the same regex
            },
            'mm/dd/YYYY': {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                parser: function (match) {
                    return (match ?
                        Date.UTC(+match[3], match[1] - 1, +match[2]) :
                        NaN);
                }
            },
            'dd/mm/YY': {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                parser: function (match) {
                    if (!match) {
                        return NaN;
                    }
                    var year = +match[3], d = new Date();
                    if (year > (d.getFullYear() - 2000)) {
                        year += 1900;
                    }
                    else {
                        year += 2000;
                    }
                    return Date.UTC(year, match[2] - 1, +match[1]);
                },
                alternative: 'mm/dd/YY' // different format with the same regex
            },
            'mm/dd/YY': {
                regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                parser: function (match) {
                    return (match ?
                        Date.UTC(+match[3] + 2000, match[1] - 1, +match[2]) :
                        NaN);
                }
            }
        };
        var decimalPoint;
        this.options = merge(DataConverter.defaultOptions, options);
        this.parseDateFn = parseDate;
        decimalPoint = this.options.decimalPoint;
        if (decimalPoint !== '.' && decimalPoint !== ',') {
            decimalPoint = void 0;
        }
        this.decimalRegex = (decimalPoint &&
            new RegExp('^(-?[0-9]+)' + decimalPoint + '([0-9]+)$'));
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Getter for a date format.
     *
     * @return {string|undefined}
     */
    DataConverter.prototype.getDateFormat = function () {
        return this.options.dateFormat;
    };
    /**
     * Converts a value to a boolean.
     *
     * @param {DataConverter.Type} value
     * Value to convert.
     *
     * @return {boolean}
     * Converted value as a boolean.
     */
    DataConverter.prototype.asBoolean = function (value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return value !== '' && value !== '0' && value !== 'false';
        }
        return this.asNumber(value) !== 0;
    };
    /**
     * Converts a value to a DataTable.
     *
     * @param {DataConverter.Type} value
     * Value to convert.
     *
     * @return {DataTable}
     * Converted value as a DataTable.
     */
    DataConverter.prototype.asDataTable = function (value) {
        if (value instanceof DataTable) {
            return value;
        }
        if (!this.asBoolean(value)) {
            return new DataTable();
        }
        if (typeof value === 'string') {
            try {
                return DataTable.fromJSON(JSON.parse(value));
            }
            catch (error) {
                return new DataTable();
            }
        }
        return DataTable.fromJSON({
            $class: 'DataTable',
            rows: [{
                    $class: 'DataTableRow',
                    cells: [JSON.parse(JSON.stringify(value))]
                }]
        });
    };
    /**
     * Converts a value to a Date.
     *
     * @param {DataConverter.Type} value
     * Value to convert.
     *
     * @return {globalThis.Date}
     * Converted value as a Date.
     */
    DataConverter.prototype.asDate = function (value) {
        var timestamp;
        if (typeof value === 'string') {
            timestamp = this.parseDate(value);
        }
        else if (typeof value === 'number') {
            timestamp = value;
        }
        else if (value instanceof Date) {
            return value;
        }
        else {
            timestamp = this.parseDate(this.asString(value));
        }
        return new Date(timestamp);
    };
    /**
     * Converts a value to a number.
     *
     * @param {DataConverter.Type} value
     * Value to convert.
     *
     * @return {number}
     * Converted value as a number.
     */
    DataConverter.prototype.asNumber = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        if (typeof value === 'string') {
            var trimVal = this.trim(value), cast = parseFloat(trimVal);
            return !isNaN(cast) ? cast : 0;
        }
        if (value instanceof DataTable) {
            return value.getRowCount();
        }
        if (value instanceof Date) {
            return value.getDate();
        }
        return 0;
    };
    /**
     * Converts a value to a string.
     *
     * @param {DataConverter.Type} value
     * Value to convert.
     *
     * @return {string}
     * Converted value as a string.
     */
    DataConverter.prototype.asString = function (value) {
        return "" + value;
    };
    /**
     * Trim a string from whitespaces.
     *
     * @param {string} str
     * String to trim.
     *
     * @param {boolean} [inside=false]
     * Remove all spaces between numbers.
     *
     * @return {string}
     * Trimed string
     */
    DataConverter.prototype.trim = function (str, inside) {
        var converter = this;
        if (typeof str === 'string') {
            str = str.replace(/^\s+|\s+$/g, '');
            // Clear white space insdie the string, like thousands separators
            if (inside && /^[0-9\s]+$/.test(str)) {
                str = str.replace(/\s/g, '');
            }
            if (converter.decimalRegex) {
                str = str.replace(converter.decimalRegex, '$1.$2');
            }
        }
        return str;
    };
    /**
     * Guesses the potential type of a string value
     * (for parsing CSV etc)
     *
     * @param {string} value
     * The string to examine
     * @return {string}
     * `string`, `Date` or `number`
     */
    DataConverter.prototype.guessType = function (value) {
        var converter = this, trimVal = converter.trim(value), trimInsideVal = converter.trim(value, true), floatVal = parseFloat(trimInsideVal);
        var result = 'string', dateVal;
        // is numeric
        if (+trimInsideVal === floatVal) {
            // If the number is greater than milliseconds in a year, assume
            // datetime.
            if (floatVal > 365 * 24 * 3600 * 1000) {
                result = 'Date';
            }
            else {
                result = 'number';
            }
            // String, continue to determine if it is
            // a date string or really a string.
        }
        else {
            if (trimVal && trimVal.length) {
                dateVal = converter.parseDate(value);
            }
            if (dateVal && isNumber(dateVal)) {
                result = 'Date';
            }
            else {
                result = 'string';
            }
        }
        return result;
    };
    /**
     * Casts a string value to it's guessed type
     * @param {string} value
     * The string to examine
     *
     * @return {number|Date|string}
     * The converted value
     */
    DataConverter.prototype.asGuessedType = function (value) {
        var converter = this, typeMap = {
            'number': converter.asNumber,
            'Date': converter.asDate,
            'string': converter.asString
        };
        return typeMap[converter.guessType(value)].call(converter, value);
    };
    /**
     * Parse a date and return it as a number.
     *
     * @function Highcharts.Data#parseDate
     *
     * @param {string} value
     * Value to parse.
     *
     * @param {string} dateFormatProp
     * Which of the predefined date formats
     * to use to parse date values.
     *
     * @return {number}
     */
    DataConverter.prototype.parseDate = function (value, dateFormatProp) {
        var converter = this;
        var dateFormat = dateFormatProp || converter.options.dateFormat, result = NaN, key, format, match;
        if (converter.parseDateFn) {
            result = converter.parseDateFn(value);
        }
        else {
            // Auto-detect the date format the first time
            if (!dateFormat) {
                for (key in converter.dateFormats) { // eslint-disable-line guard-for-in
                    format = converter.dateFormats[key];
                    match = value.match(format.regex);
                    if (match) {
                        // converter.options.dateFormat = dateFormat = key;
                        dateFormat = key;
                        // converter.options.alternativeFormat =
                        // format.alternative || '';
                        result = format.parser(match);
                        break;
                    }
                }
                // Next time, use the one previously found
            }
            else {
                format = converter.dateFormats[dateFormat];
                if (!format) {
                    // The selected format is invalid
                    format = converter.dateFormats['YYYY/mm/dd'];
                }
                match = value.match(format.regex);
                if (match) {
                    result = format.parser(match);
                }
            }
            // Fall back to Date.parse
            if (!match) {
                if (value.match(/:.+(GMT|UTC|[Z+-])/)) {
                    value = value
                        .replace(/\s*(?:GMT|UTC)?([+-])(\d\d)(\d\d)$/, '$1$2:$3')
                        .replace(/(?:\s+|GMT|UTC)([+-])/, '$1')
                        .replace(/(\d)\s*(?:GMT|UTC|Z)$/, '$1+00:00');
                }
                match = Date.parse(value);
                // External tools like Date.js and MooTools extend Date object
                // and returns a date.
                if (typeof match === 'object' &&
                    match !== null &&
                    match.getTime) {
                    result = (match.getTime() -
                        match.getTimezoneOffset() *
                            60000);
                    // Timestamp
                }
                else if (isNumber(match)) {
                    result = match - (new Date(match)).getTimezoneOffset() * 60000;
                }
            }
        }
        return result;
    };
    /**
     * Tries to guess the date format
     *  - Check if either month candidate exceeds 12
     *  - Check if year is missing (use current year)
     *  - Check if a shortened year format is used (e.g. 1/1/99)
     *  - If no guess can be made, the user must be prompted
     * data is the data to deduce a format based on
     * @private
     *
     * @param {Array<string>} data
     * Data to check the format.
     *
     * @param {number} limit
     * Max data to check the format.
     *
     * @param {boolean} save
     * Whether to save the date format in the converter options.
     *
     * @return {string}
     */
    DataConverter.prototype.deduceDateFormat = function (data, limit, save) {
        var parser = this, stable = [], max = [];
        var format = 'YYYY/mm/dd', thing, guessedFormat = [], i = 0, madeDeduction = false, 
        // candidates = {},
        elem, j;
        if (!limit || limit > data.length) {
            limit = data.length;
        }
        for (; i < limit; i++) {
            if (typeof data[i] !== 'undefined' &&
                data[i] && data[i].length) {
                thing = data[i]
                    .trim()
                    .replace(/\//g, ' ')
                    .replace(/\-/g, ' ')
                    .replace(/\./g, ' ')
                    .split(' ');
                guessedFormat = [
                    '',
                    '',
                    ''
                ];
                for (j = 0; j < thing.length; j++) {
                    if (j < guessedFormat.length) {
                        elem = parseInt(thing[j], 10);
                        if (elem) {
                            max[j] = (!max[j] || max[j] < elem) ? elem : max[j];
                            if (typeof stable[j] !== 'undefined') {
                                if (stable[j] !== elem) {
                                    stable[j] = false;
                                }
                            }
                            else {
                                stable[j] = elem;
                            }
                            if (elem > 31) {
                                if (elem < 100) {
                                    guessedFormat[j] = 'YY';
                                }
                                else {
                                    guessedFormat[j] = 'YYYY';
                                }
                                // madeDeduction = true;
                            }
                            else if (elem > 12 &&
                                elem <= 31) {
                                guessedFormat[j] = 'dd';
                                madeDeduction = true;
                            }
                            else if (!guessedFormat[j].length) {
                                guessedFormat[j] = 'mm';
                            }
                        }
                    }
                }
            }
        }
        if (madeDeduction) {
            // This handles a few edge cases with hard to guess dates
            for (j = 0; j < stable.length; j++) {
                if (stable[j] !== false) {
                    if (max[j] > 12 &&
                        guessedFormat[j] !== 'YY' &&
                        guessedFormat[j] !== 'YYYY') {
                        guessedFormat[j] = 'YY';
                    }
                }
                else if (max[j] > 12 && guessedFormat[j] === 'mm') {
                    guessedFormat[j] = 'dd';
                }
            }
            // If the middle one is dd, and the last one is dd,
            // the last should likely be year.
            if (guessedFormat.length === 3 &&
                guessedFormat[1] === 'dd' &&
                guessedFormat[2] === 'dd') {
                guessedFormat[2] = 'YY';
            }
            format = guessedFormat.join('/');
            // If the caculated format is not valid, we need to present an
            // error.
        }
        // Save the deduced format in the converter options.
        if (save) {
            parser.options.dateFormat = format;
        }
        return format;
    };
    /**
     * Default options
     */
    DataConverter.defaultOptions = {
        dateFormat: '',
        alternativeFormat: ''
    };
    return DataConverter;
}());
/* *
 *
 *  Export
 *
 * */
export default DataConverter;
