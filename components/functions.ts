export function delay(delay: number) {
    return new Promise(r => {
        setTimeout(r, delay);
    })
}

export function randomStringGenerator(length:number){
    let result = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for(var i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}