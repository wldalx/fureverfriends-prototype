// convert a date in year-month-day format, years are incremented by x if specified
export function convertDate(convert, x = 0) {
    const date = new Date(convert)
    const year = date.getFullYear()
    const month = (date.getMonth() < 9) ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
    const day = (date.getDate() < 10) ? ("0" + date.getDate()) : date.getDate();
    const converted = (year + x) + "-" + month + "-" + day;

    return converted
}

// convert availability array (array of {startDate, endDate}) to [string, string] for calendar
export function convertDateArray(dates) {
    let converted = []
    dates.forEach(date => {
        converted.push([convertDate(date.startDate), convertDate(date.endDate)])
    })

    return converted;
}

export function getCurrentDate() {
    const today = new Date();
    return convertDate(today);
}

export function getDateInXYears(x) {
    const today = new Date();
    const dateInXYears = convertDate(today, x)
    return dateInXYears;
}

// add x days to startDate
export function getDateInXDays(startDate, x) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + x) // auto-overflow to next month/year/…
    const dateInXDays = convertDate(date)

    return dateInXDays
}

// calculate difference in days between two dates
export function diffInDays(startDate, endDate) {
    const start = new Date(convertDate(startDate))
    const end = new Date(convertDate(endDate))
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    return days
}

// get minimum of 2d-date array (used for availbilities)
export function getMinimum(dates) {
    const min = dates.reduce(
        // 2d-date array is sorted by time, thus just date[0]
        (minimum, date) => diffInDays(date[0], minimum) > 0 ? date[0] : minimum,
        getDateInXYears(1)
    );
    const minimum = convertDate(min)

    return minimum;
}

// get maximum of 2d-date array (used for availbilities)
export function getMaximum(dates) {
    const max = dates.reduce(
        // 2d-date array is sorted by time, thus just date[1]
        (maximum, date) => (diffInDays(maximum, date[1]) > 0) ? date[1] : maximum,
        getDateInXDays(new Date(), -1)
    );
    const maximum = convertDate(max)

    return maximum;
}

// used to check wheter a date-frame is included in an 2d-date array
// x is used for minimum date-frame size (used for availbilities)
export function getInDateFrame(dates, date, x = 0) {
    const inDate = new Date(date)
    const dateFrame = dates.find(date => 
        diffInDays(date[0], inDate) >= 0
        && diffInDays(inDate, date[1]) >= (0 + x)
    )

    return dateFrame;
}

// used to get the nearest date frame before and after a specified date in a 2d-date array
// x is used for minimum date-frame size (used for suggestions of availbilities around desired one)
export function datesBeforeAndAfter(dates, date, x = 0) {
    const currentDate = new Date(date)
    const beforeAccumulator = getDateInXDays(new Date(), -1)
    const afterAccumulator = new Date(getDateInXYears(1))

    // nearest date frame before `date`
    let before = dates.reduce(
        (accumulator, date) =>
            (diffInDays(accumulator[1], date[1]) > 0 // walk into future
                && diffInDays(date[1], currentDate) >= 0 // select only date frames before `date` (get nearest before `date`)
                && diffInDays(date[0], date[1]) >= x) // min date frame size (e.g. for overnight stay)
            ? [date[0], date[1]]
            : accumulator,
        [beforeAccumulator, beforeAccumulator] // start one day before `date`
    )

    // nearest date frame after `date`
    let after = dates.reduce(
        (accumulator, date) =>
            (diffInDays(date[0], accumulator[0]) > 0 // walk into past
                && diffInDays(currentDate, date[0]) >= 0 // select only date frames after `date` (get nearest after `date`)
                && diffInDays(date[0], date[1]) >= x) // min date frame size (e.g. for overnight stay)
            ? [date[0], date[1]]
            : accumulator,
        [afterAccumulator, afterAccumulator] // start a year after `date`
    )

    if (before[0] === beforeAccumulator || before[1] === beforeAccumulator)
        before = undefined // nothing found

    if (after[0] === afterAccumulator || after[1] === afterAccumulator)
        after = undefined // nothing found

    return [before, after];
}

export function getAllDaysBetweenDates(startDate, endDate) {
    let result = [];
    while (startDate <= endDate) {
        result.push(convertDate(new Date(startDate)));
        startDate.setDate(startDate.getDate() + 1)
    }
    return result;
}
