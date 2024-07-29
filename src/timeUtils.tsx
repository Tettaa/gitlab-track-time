import moment from 'moment';

function secondsToHumanReadable(seconds: number) {
    const duration = moment.duration(seconds, 'seconds');
    return duration.humanize();
}

function toHuman(totalSeconds: number ) {
    //const totalSeconds = 3660; // Example: 1 hour and 1 minute
    const humanReadableTime = secondsToHumanReadable(totalSeconds);
    console.log(humanReadableTime);
    return humanReadableTime;
}  


export {toHuman};