import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ローカルマシンのタイムゾーン
export const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// 現在時刻をローカルタイムゾーンで取得
export const now = () => dayjs().tz(tz);

export default dayjs;
