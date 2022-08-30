import { Timestamp } from 'firebase/firestore';
import moment from 'moment';
import i18n from '../i18n';
import 'moment/locale/vi';

// const langVal = use

export const firebaseDateFormat = (value: Date) => {
    const langVal = i18n.language;
    if (langVal === 'vn') moment.locale('vi');
    if (langVal === 'en') moment.locale('en');
    const val = moment((value as unknown as Timestamp).toDate());
    return val.format('dddd, MMMM Do YYYY, h:mm:ss a');
};

export const firebaseRelativeDateFormat = (value: Date) => {
    return moment((value as unknown as Timestamp).toDate()).fromNow();
};
