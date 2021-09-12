import { timeDiff } from './time-diff';

describe('timeDiff', () => {

    it('Date - Date', () => {
        expect(timeDiff(new Date('Sun Sep 12 2021 13:23:25 GMT+0000'), new Date('Sun Sep 12 2021 13:23:24 GMT+0000')))
            .toEqual(1000);
    });

    it('Date - duration', () => {
        expect(timeDiff(new Date('Sun Sep 12 2021 13:23:25 GMT+0000'), '10m'))
            .toEqual(new Date('Sun Sep 12 2021 13:13:25 GMT+0000'));
    });

    it('Date - milliseconds', () => {
        expect(timeDiff(new Date('Sun Sep 12 2021 13:23:25 GMT+0000'), 1000))
            .toEqual(new Date('Sun Sep 12 2021 13:23:24 GMT+0000'));
    });

    it('Date - -milliseconds', () => {
        expect(timeDiff(new Date('Sun Sep 12 2021 13:23:25 GMT+0000'), -1000))
            .toEqual(new Date('Sun Sep 12 2021 13:23:26 GMT+0000'));
    });
  });