'use strict'

var React  = require('react')
var moment = require('moment')
var assign = require('object-assign')

var FORMAT   = require('./utils/format')
var asConfig = require('./utils/asConfig')
var toMoment = require('./toMoment')
var onEnter  = require('./onEnter')
var assign   = require('object-assign')

var TODAY

function emptyFn(){}

var DecadeView = React.createClass({

    displayName: 'DecadeView',

    getDefaultProps: function() {
        return asConfig()
    },

    /**
     * Returns all the years in the decade of the given value
     *
     * @param  {Moment/Date/Number} value
     * @return {Moment[]}
     */
    getYearsInDecade: function(value){
        var year = moment(value).get('year')
        var offset = year % 10

        year = year - offset - 1

        var result = []
        var i = 0

        var start = moment(year, 'YYYY').startOf('year')

        for (; i < 12; i++){
            result.push(moment(start))
            start.add(1, 'year')
        }

        return result
    },

    render: function() {

        TODAY = +moment().startOf('day')

        var props = assign({}, this.props)

        var viewMoment = props.viewMoment = moment(this.props.viewDate)

        if (props.date){
            props.moment = moment(props.date).startOf('year')
        }

        var yearsInView = this.getYearsInDecade(viewMoment)

        return (
            <table className="dp-table dp-decade-view">
                <tbody>
                    {this.renderYears(props, yearsInView)}
                </tbody>
            </table>
        )
    },

    /**
     * Render the given array of days
     * @param  {Moment[]} days
     * @return {React.DOM}
     */
    renderYears: function(props, days) {
        var nodes      = days.map(function(date, index, arr){
            return this.renderYear(props, date, index, arr)
        }, this)
        var len        = days.length
        var buckets    = []
        var bucketsLen = Math.ceil(len / 4)

        var i = 0

        for ( ; i < bucketsLen; i++){
            buckets.push(nodes.slice(i * 4, (i + 1) * 4))
        }

        return buckets.map(function(bucket, i){
            return <tr key={"row" + i} >{bucket}</tr>
        })
    },

    renderYear: function(props, date, index, arr) {
        var yearText = FORMAT.year(date, props.yearFormat)
        var classes = ["dp-cell dp-year"]

        var dateTimestamp = +date

        if (dateTimestamp == props.moment){
            classes.push('dp-value')
        }

        if (!index){
            classes.push('dp-prev')
        }

        if (index == arr.length - 1){
            classes.push('dp-next')
        }

        var onClick = this.handleClick.bind(this, props, date)



        return (
            <td
                role="link"
                tabIndex="1"
                key={yearText}
                className={classes.join(' ')}
                onClick={onClick}
                onKeyUp={onEnter(onClick)}
            >
                {
                    (moment.locale() === 'ja') ? moment().year(yearText).toDate().toLocaleDateString(props.calendar, {year: 'numeric'}): FORMAT.getYearText(yearText)
                }
            </td>
        )
    },

    handleClick: function(props, date, event) {
        event.target.value = date
        ;(props.onSelect || emptyFn)(date, event)
    }
})

DecadeView.getHeaderText = function(value, props) {
    var year = moment(value).get('year')
    var offset = year % 10

    year = year - offset - 1

    if(moment.locale() === 'ja')
        return moment().year(year).toDate().toLocaleDateString(props.calendar, {year: 'numeric'}) + ' - ' + moment().year(year + 11).toDate().toLocaleDateString(props.calendar, {year: 'numeric'})
    else if (props.calendar === 'ja-JP-u-ca-japanese')
        return FORMAT.getYearText(year) + ' - ' + FORMAT.getYearText(year + 11)
    else
        return year +  ' - ' + (year + 11);
}

module.exports = DecadeView
