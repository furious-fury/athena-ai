const currentDate = new Date();
const url = `https://gamma-api.polymarket.com/markets?closed=false&active=true&end_date_min=${currentDate.toISOString()}`;
export const getMarkets = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            console.log(data[i].question);
            console.log('-----------------------------------');
        }
    }
    catch (error) {
        console.error(error);
    }
};
//# sourceMappingURL=index.js.map