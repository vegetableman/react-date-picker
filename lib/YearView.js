'use strict';

var React = require('react');
var moment = require('moment');

var FORMAT = require('./utils/format');
var asConfig = require('./utils/asConfig');
var toMoment = require('./toMoment');
var onEnter = require('./onEnter');
var assign = require('object-assign');

var TODAY;

function emptyFn() {}

var YearView = React.createClass({

    displayName: 'YearView',

    getDefaultProps: function getDefaultProps() {

        return asConfig();
    },

    /**
     * Returns all the days in the specified month.
     *
     * @param  {Moment/Date/Number} value
     * @return {Moment[]}
     */
    getMonthsInYear: function getMonthsInYear(value) {
        var start = moment(value).startOf('year');
        var result = [];
        var i = 0;

        for (; i < 12; i++) {
            result.push(moment(start));
            start.add(1, 'month');
        }

        return result;
    },

    render: function render() {

        TODAY = +moment().startOf('day');

        var props = assign({}, this.props);

        var viewMoment = props.viewMoment = moment(this.props.viewDate);

        if (props.date) {
            props.moment = moment(props.date).startOf('month');
        }

        var monthsInView = this.getMonthsInYear(viewMoment);

        return React.createElement(
            'table',
            { className: 'dp-table dp-year-view' },
            React.createElement(
                'tbody',
                null,
                this.renderMonths(props, monthsInView)
            )
        );
    },

    /**
     * Render the given array of days
     * @param  {Moment[]} days
     * @return {React.DOM}
     */
    renderMonths: function renderMonths(props, days) {
        var nodes = days.map(function (date) {
            return this.renderMonth(props, date);
        }, this);
        var len = days.length;
        var buckets = [];
        var bucketsLen = Math.ceil(len / 4);

        var i = 0;

        for (; i < bucketsLen; i++) {
            buckets.push(nodes.slice(i * 4, (i + 1) * 4));
        }

        return buckets.map(function (bucket, i) {
            return React.createElement(
                'tr',
                { key: 'row' + i },
                bucket
            );
        });
    },

    renderMonth: function renderMonth(props, date) {
        var monthText = FORMAT.month(date, props.monthFormat);
        var classes = ['dp-cell dp-month'];

        var dateTimestamp = +date;

        if (dateTimestamp == props.moment) {
            classes.push('dp-value');
        }

        var onClick = this.handleClick.bind(this, props, date);

        return React.createElement(
            'td',
            {
                tabIndex: '1',
                role: 'link',
                key: monthText,
                className: classes.join(' '),
                onClick: onClick,
                onKeyUp: onEnter(onClick)
            },
            monthText
        );
    },

    handleClick: function handleClick(props, date, event) {
        event.target.value = date;(props.onSelect || emptyFn)(date, event);
    }
});

YearView.getHeaderText = function (moment, props) {
    if (moment.locale() === 'ja') return toMoment(moment, null, { locale: props.locale }).toDate().toLocaleDateString(props.calendar, { year: 'numeric' });else if (props.calendar === 'ja-JP-u-ca-japanese') return FORMAT.getYearText(toMoment(moment, null, { locale: props.locale }).format('YYYY'));else return year + ' - ' + (year + 11);
};

module.exports = YearView;