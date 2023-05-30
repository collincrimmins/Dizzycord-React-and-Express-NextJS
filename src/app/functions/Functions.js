export const sleep = (ms) => {
    // await sleep(1000);
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const verifyTextInput = (InputText) => {
    if (InputText === "" || !/\S/.test(InputText)) {
        return false
    }
    return true
}