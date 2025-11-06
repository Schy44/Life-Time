
const COUNTRIES = [
    { name: "Afghanistan", code: "AF" },
    { name: "Bangladesh", code: "BD" },
    { name: "Brazil", code: "BR" },
    { name: "Canada", code: "CA" },
    { name: "Germany", code: "DE" },
    { name: "India", code: "IN" },
    { name: "Japan", code: "JP" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
];

export const getCountries = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(COUNTRIES.map(c => ({...c, value: c.code, label: c.name})));
        }, 500);
    });
};
