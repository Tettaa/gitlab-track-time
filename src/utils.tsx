import moment from 'moment';

function secondsToHumanReadable(seconds: number) {
    const duration = moment.duration(seconds, 'seconds');
    return duration.asHours();
}

function toHuman(totalSeconds: number ) {
    const humanReadableTime = secondsToHumanReadable(totalSeconds);
    console.log(humanReadableTime);
    return humanReadableTime;
}  


const isEmpty = (obj) => {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export {toHuman, isEmpty};