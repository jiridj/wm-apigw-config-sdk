const auth = require('../lib/auth');
const axios = require('axios');
const fs = require('fs');
const promo = require('../lib/promotion');

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);

const allData = JSON.parse(fs.readFileSync('test/files/stages-success.json'));
const all = { status: 200, data: allData };

const promoData = JSON.parse(fs.readFileSync('test/files/promotion-success.json'));
const promotion = { status: 200, data: promoData };

beforeAll(() => {
    auth.setup(
        'http://localhost:5555',
        'username',
        'password'
    );
});

afterAll(() => {
    auth.reset();
});

describe('test findStage', () => {

    it('should succeed', async () => {
        mockedAxios.get.mockResolvedValueOnce(all);

        const result = await promo.findStage('staging');
        expect(result).toBe(allData.stages[0]);
    });

    it('should fail because not found', async () => {
        mockedAxios.get.mockResolvedValueOnce(all);

        try {
            await promo.findStage('doesnotexist');

            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('Stage with name doesnotexist does not exist!');
        }
    });

});

describe('test promoteApi', () => {

    it('should succeed', async () => {
        mockedAxios.post.mockResolvedValueOnce(promotion);

        const result = await promo.promoteApi(
            promoData.promotion.name,
            promoData.promotion.promotedAssets.api[0],
            promoData.promotion.destinationStages[0]
        );
        expect(result).toBe(promoData.promotion);
    });

});